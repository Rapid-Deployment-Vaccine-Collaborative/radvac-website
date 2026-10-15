#!/usr/bin/env python3
"""Build the FRIL tetramer model used by the /fril-draft graphics.

Reads the 9VBW mmCIF (FRIL from Lablab purpureus bound to a Lewis X
tetrasaccharide, 2.49 A X-ray) and writes public/models/fril-9vbw.json with:

  - surface / surfaceLow: a blurred molecular envelope (marching cubes on a
    Gaussian density of the protein's heavy atoms), decimated to two levels of
    detail, in the same spirit as the negative-stain EM density of the FRIL
    tetramer in Liu et al. 2020 (Cell Reports 32:108016, Fig. 1E);
  - chains: C-alpha traces for the four monomers;
  - sites: the bound tetrasaccharide in each monomer's carbohydrate-binding
    site, one entry per sugar residue (SNFG type + centroid) plus the
    glycosidic links between them.

Coordinates are in angstroms, centred on the tetramer and rotated onto its
three 2-fold (D2) symmetry axes, found from the four binding-site centroids:
looking down z, the four sites sit at the corners of the familiar "X".

Usage:
  curl -sSfLO https://files.rcsb.org/download/9VBW.cif
  pip install gemmi numpy scikit-image pyfqmr
  python3 scripts/build-fril-model.py 9VBW.cif public/models/fril-9vbw.json
"""

import json
import sys

import gemmi
import numpy as np
import pyfqmr
from skimage import measure

# Biological assembly 1 of 9VBW: protein subchains A, C, H, M (author chains
# A, C, D, B) and the tetrasaccharides bound to them (Q, S, X, EA).
PROTEIN_SUBCHAINS = ["A", "M", "C", "H"]
GLYCAN_SUBCHAINS = ["Q", "EA", "S", "X"]

GRID_A = 1.6  # density grid spacing, angstroms
SIGMA_A = 2.6  # Gaussian blur per atom; larger = smoother, EM-like envelope
ISO_FRACTION = 0.16  # iso-level as a fraction of the density's 99.5th pct
FACES_HIGH = 2400
FACES_LOW = 520


def subchain_atoms(model, subchain_id):
    for chain in model:
        for res in chain:
            if res.subchain == subchain_id:
                yield res


def heavy_atom_coords(model):
    pts = []
    for sc in PROTEIN_SUBCHAINS:
        for res in subchain_atoms(model, sc):
            for atom in res:
                if atom.element.name != "H":
                    pts.append(atom.pos.tolist())
    return np.array(pts)


def ca_traces(model):
    traces = []
    for sc in PROTEIN_SUBCHAINS:
        trace = []
        for res in subchain_atoms(model, sc):
            ca = res.find_atom("CA", "*")
            if ca:
                trace.append(ca.pos.tolist())
        traces.append(np.array(trace))
    return traces


def glycan_sites(model):
    sites = []
    for sc in GLYCAN_SUBCHAINS:
        residues = list(subchain_atoms(model, sc))
        sugars = []
        coords = []
        for res in residues:
            xyz = np.array([a.pos.tolist() for a in res if a.element.name != "H"])
            coords.append(xyz)
            sugars.append({"type": res.name, "pos": xyz.mean(axis=0)})
        links = []
        for i in range(len(residues)):
            for j in range(i + 1, len(residues)):
                d = np.linalg.norm(coords[i][:, None, :] - coords[j][None, :, :], axis=2)
                if d.min() < 1.8:
                    links.append([i, j])
        sites.append({"sugars": sugars, "links": links})
    return sites


def envelope(points):
    lo = points.min(axis=0) - 4 * SIGMA_A
    hi = points.max(axis=0) + 4 * SIGMA_A
    shape = np.ceil((hi - lo) / GRID_A).astype(int) + 1
    grid = np.zeros(shape, dtype=np.float32)
    # Splat each atom as a Gaussian over a local window.
    r = int(np.ceil(3 * SIGMA_A / GRID_A))
    offs = np.arange(-r, r + 1)
    ox, oy, oz = np.meshgrid(offs, offs, offs, indexing="ij")
    for p in points:
        c = np.round((p - lo) / GRID_A).astype(int)
        gx, gy, gz = ox + c[0], oy + c[1], oz + c[2]
        d2 = (
            (gx * GRID_A + lo[0] - p[0]) ** 2
            + (gy * GRID_A + lo[1] - p[1]) ** 2
            + (gz * GRID_A + lo[2] - p[2]) ** 2
        )
        np.add.at(grid, (gx, gy, gz), np.exp(-d2 / (2 * SIGMA_A**2)))
    level = ISO_FRACTION * np.percentile(grid, 99.5)
    verts, faces, _, _ = measure.marching_cubes(grid, level=level, spacing=(GRID_A,) * 3)
    return verts + lo, faces


def decimate(verts, faces, target):
    s = pyfqmr.Simplify()
    s.setMesh(verts, faces)
    s.simplify_mesh(target_count=target, aggressiveness=7, preserve_border=False, verbose=False)
    v, f, _ = s.getMesh()
    return v, f


def main(src, dst):
    st = gemmi.read_structure(src)
    model = st[0]

    atoms = heavy_atom_coords(model)
    center = atoms.mean(axis=0)
    sites = glycan_sites(model)
    # In a D2 tetramer each 2-fold axis passes through the midpoint of a pair
    # of binding sites. Orthonormalise those three midpoint directions.
    sc = [np.mean([s["pos"] for s in site["sugars"]], axis=0) - center for site in sites]
    z = (sc[0] + sc[1]) / 2
    x = (sc[0] + sc[2]) / 2
    z /= np.linalg.norm(z)
    x -= z * (x @ z)
    x /= np.linalg.norm(x)
    y = np.cross(z, x)
    rot = np.array([x, y, z])  # rows are the new x, y, z axes

    def tf(p):
        return (np.asarray(p) - center) @ rot.T

    verts, faces = envelope(atoms)
    hv, hf = decimate(verts, faces, FACES_HIGH)
    lv, lf = decimate(verts, faces, FACES_LOW)

    def mesh(v, f):
        return {
            "positions": [round(float(x), 1) for x in tf(v).ravel()],
            "indices": [int(i) for i in np.asarray(f).ravel()],
        }

    out = {
        "source": "PDB 9VBW, biological assembly 1",
        "units": "angstrom",
        "surface": mesh(hv, hf),
        "surfaceLow": mesh(lv, lf),
        "chains": [[round(float(x), 1) for x in tf(t).ravel()] for t in ca_traces(model)],
        "sites": [
            {
                "sugars": [
                    {"type": s["type"], "pos": [round(float(x), 2) for x in tf(s["pos"])]}
                    for s in site["sugars"]
                ],
                "links": site["links"],
            }
            for site in sites
        ],
    }
    with open(dst, "w") as fh:
        json.dump(out, fh, separators=(",", ":"))

    extent = tf(atoms)
    print(f"atoms={len(atoms)} raw faces={len(faces)} high={len(hf)} low={len(lf)}")
    print("extent (A):", np.round(extent.max(axis=0) - extent.min(axis=0), 1))
    for i, site in enumerate(out["sites"]):
        c = np.mean([s["pos"] for s in site["sugars"]], axis=0)
        print(f"site {i}: {[s['type'] for s in site['sugars']]} links={site['links']} centroid={np.round(c, 1)}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
