import * as THREE from "three";

const WIRE_COLOR = 0x3a8ad8;

export type Built = {
  group: THREE.Group;
  update: (elapsedSec: number, opts?: { shake?: number }) => void;
  dispose: () => void;
};

export type PillsBuilt = Built & {
  hitProxy: THREE.Mesh;
};

export function buildPills(): PillsBuilt {
  const group = new THREE.Group();
  const disposers: Array<() => void> = [];

  const lineMat = new THREE.LineBasicMaterial({
    color: WIRE_COLOR,
    transparent: true,
    opacity: 0.95,
  });
  disposers.push(() => lineMat.dispose());

  type PillState = {
    mesh: THREE.LineSegments;
    baseX: number;
    baseY: number;
    baseRotZ: number;
    phase: number;
  };
  const pills: PillState[] = [];

  const pillSpecs = [
    { baseX: -0.45, baseY: 0.05, baseRotZ: 0.35, phase: 0, fill: 0xf2a93a },
    { baseX: 0.45, baseY: -0.05, baseRotZ: -0.5, phase: 1.7, fill: 0xe04545 },
    { baseX: 0.0, baseY: 0.7, baseRotZ: -0.15, phase: 3.1, fill: 0x4ac572 },
  ];

  for (const spec of pillSpecs) {
    const capGeom = new THREE.CapsuleGeometry(0.16, 0.42, 6, 14);
    const capWire = new THREE.WireframeGeometry(capGeom);
    const pill = new THREE.LineSegments(capWire, lineMat);
    pill.position.set(spec.baseX, spec.baseY, 0);
    pill.rotation.z = spec.baseRotZ;
    const fillGeom = new THREE.CapsuleGeometry(0.155, 0.41, 6, 14);
    const fillMat = new THREE.MeshBasicMaterial({
      color: spec.fill,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    pill.add(new THREE.Mesh(fillGeom, fillMat));
    group.add(pill);
    pills.push({
      mesh: pill,
      baseX: spec.baseX,
      baseY: spec.baseY,
      baseRotZ: spec.baseRotZ,
      phase: spec.phase,
    });
    disposers.push(
      () => capGeom.dispose(),
      () => capWire.dispose(),
      () => fillGeom.dispose(),
      () => fillMat.dispose(),
    );
  }

  const hitGeom = new THREE.BoxGeometry(1.6, 1.0, 0.6);
  const hitMat = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const hitProxy = new THREE.Mesh(hitGeom, hitMat);
  group.add(hitProxy);
  disposers.push(() => hitGeom.dispose(), () => hitMat.dispose());

  return {
    group,
    hitProxy,
    update(t, opts) {
      const shake = opts?.shake ?? 0;
      const shakeAmp = 1 + shake;
      const jitter = shake * 0.08;
      for (const p of pills) {
        p.mesh.rotation.z =
          p.baseRotZ +
          Math.sin(t * 1.0 + p.phase) * 0.22 * shakeAmp +
          (Math.random() - 0.5) * jitter * 2;
        p.mesh.position.y =
          p.baseY +
          Math.sin(t * 1.3 + p.phase) * 0.07 * shakeAmp +
          (Math.random() - 0.5) * jitter;
        p.mesh.position.x =
          p.baseX +
          Math.cos(t * 0.8 + p.phase) * 0.03 * shakeAmp +
          (Math.random() - 0.5) * jitter;
      }
    },
    dispose() {
      for (const d of disposers) d();
    },
  };
}

export type H2O2Built = Built & {
  hitProxy: THREE.Mesh;
};

export function buildH2O2Bottle(): H2O2Built {
  const group = new THREE.Group();
  const disposers: Array<() => void> = [];

  const lineMat = new THREE.LineBasicMaterial({
    color: WIRE_COLOR,
    transparent: true,
    opacity: 0.95,
  });
  disposers.push(() => lineMat.dispose());

  const bodyProfile = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.18, 0.0),
    new THREE.Vector2(0.22, 0.05),
    new THREE.Vector2(0.23, 0.13),
    new THREE.Vector2(0.23, 0.78),
    new THREE.Vector2(0.21, 0.84),
    new THREE.Vector2(0.14, 0.91),
    new THREE.Vector2(0.1, 0.95),
  ];
  const bodyGeom = new THREE.LatheGeometry(bodyProfile, 12);
  const bodyWire = new THREE.WireframeGeometry(bodyGeom);
  group.add(new THREE.LineSegments(bodyWire, lineMat));
  disposers.push(() => bodyGeom.dispose(), () => bodyWire.dispose());

  // Light-teal liquid filling most of the bottle body. Profile sits just
  // inside the wall so the wireframe edges read on the outside.
  // 88% fill of the cylindrical bottle interior (y=0 to y=0.78).
  const liquidFillTop = 0.78 * 0.88;
  const liquidProfile = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.165, 0.0),
    new THREE.Vector2(0.205, 0.05),
    new THREE.Vector2(0.215, 0.13),
    new THREE.Vector2(0.215, liquidFillTop),
    new THREE.Vector2(0.0, liquidFillTop),
  ];
  const liquidGeom = new THREE.LatheGeometry(liquidProfile, 24);
  const liquidMat = new THREE.MeshBasicMaterial({
    color: 0xc5ede6,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  group.add(new THREE.Mesh(liquidGeom, liquidMat));
  disposers.push(() => liquidGeom.dispose(), () => liquidMat.dispose());

  const capGeom = new THREE.CylinderGeometry(0.115, 0.115, 0.13, 16, 1, false);
  const capWire = new THREE.WireframeGeometry(capGeom);
  const cap = new THREE.LineSegments(capWire, lineMat);
  cap.position.y = 0.95 + 0.065;
  group.add(cap);
  disposers.push(() => capGeom.dispose(), () => capWire.dispose());

  const labelCanvas = document.createElement("canvas");
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const LBL_W = 384;
  const LBL_H = 192;
  labelCanvas.width = LBL_W * dpr;
  labelCanvas.height = LBL_H * dpr;
  const ctx = labelCanvas.getContext("2d")!;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, LBL_W, LBL_H);
  ctx.font =
    "900 128px ui-sans-serif, system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#3a8ad8";
  ctx.fillText("H2O2", LBL_W / 2, LBL_H / 2);
  const labelTex = new THREE.CanvasTexture(labelCanvas);
  labelTex.colorSpace = THREE.SRGBColorSpace;
  labelTex.needsUpdate = true;
  const labelMat = new THREE.MeshBasicMaterial({
    map: labelTex,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const LABEL_R = 0.232;
  const LABEL_H = 0.27;
  const LABEL_WIDTH = 0.54;
  const LABEL_ARC = LABEL_WIDTH / LABEL_R;
  const labelGeom = new THREE.CylinderGeometry(
    LABEL_R,
    LABEL_R,
    LABEL_H,
    24,
    1,
    true,
    -LABEL_ARC / 2,
    LABEL_ARC,
  );
  const label = new THREE.Mesh(labelGeom, labelMat);
  label.position.set(0, 0.45, 0);
  group.add(label);
  disposers.push(
    () => labelTex.dispose(),
    () => labelMat.dispose(),
    () => labelGeom.dispose(),
  );

  const hitGeom = new THREE.CylinderGeometry(0.3, 0.3, 1.15, 12);
  const hitMat = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const hitProxy = new THREE.Mesh(hitGeom, hitMat);
  hitProxy.position.y = 0.55;
  group.add(hitProxy);
  disposers.push(() => hitGeom.dispose(), () => hitMat.dispose());

  return {
    group,
    hitProxy,
    update() {},
    dispose() {
      for (const d of disposers) d();
    },
  };
}

export type NasalSprayBuilt = Built & {
  hitProxy: THREE.Mesh;
};

export function buildNasalSpray(): NasalSprayBuilt {
  const group = new THREE.Group();
  const disposers: Array<() => void> = [];

  const lineMat = new THREE.LineBasicMaterial({
    color: WIRE_COLOR,
    transparent: true,
    opacity: 0.95,
  });
  disposers.push(() => lineMat.dispose());

  // Bottle body — straight cylindrical sides, rounded bottom, flat shoulder
  // stepping in to a short neck (matches a typical OTC nasal-spray silhouette).
  const bodyProfile = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.16, 0.0),
    new THREE.Vector2(0.22, 0.06),
    new THREE.Vector2(0.22, 0.62),
    new THREE.Vector2(0.2, 0.64),
    new THREE.Vector2(0.1, 0.67),
    new THREE.Vector2(0.1, 0.74),
  ];
  const bodyGeom = new THREE.LatheGeometry(bodyProfile, 16);
  const bodyWire = new THREE.WireframeGeometry(bodyGeom);
  group.add(new THREE.LineSegments(bodyWire, lineMat));
  const bodyFillMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.22,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  group.add(new THREE.Mesh(bodyGeom, bodyFillMat));
  disposers.push(
    () => bodyGeom.dispose(),
    () => bodyWire.dispose(),
    () => bodyFillMat.dispose(),
  );

  // Ridged collar — short cylinder sitting on the neck (the white grip ring
  // on a real nasal-spray pump).
  const COLLAR_H = 0.2;
  const collarGeom = new THREE.CylinderGeometry(0.16, 0.16, COLLAR_H, 16, 1, false);
  const collarWire = new THREE.WireframeGeometry(collarGeom);
  const collar = new THREE.LineSegments(collarWire, lineMat);
  const collarBaseY = 0.74;
  collar.position.y = collarBaseY + COLLAR_H / 2;
  group.add(collar);
  disposers.push(() => collarGeom.dispose(), () => collarWire.dispose());

  // Flange — thin wider disc capping the collar, just below the nozzle.
  const FLANGE_H = 0.04;
  const flangeGeom = new THREE.CylinderGeometry(0.22, 0.22, FLANGE_H, 20, 1, false);
  const flangeWire = new THREE.WireframeGeometry(flangeGeom);
  const flange = new THREE.LineSegments(flangeWire, lineMat);
  const flangeBaseY = collarBaseY + COLLAR_H;
  flange.position.y = flangeBaseY + FLANGE_H / 2;
  group.add(flange);
  disposers.push(() => flangeGeom.dispose(), () => flangeWire.dispose());

  // Nozzle — tall straight cone pointing up (no tilt).
  const NOZZLE_LEN = 0.42;
  const nozzleGeom = new THREE.CylinderGeometry(0.02, 0.07, NOZZLE_LEN, 14, 1, false);
  const nozzleWire = new THREE.WireframeGeometry(nozzleGeom);
  const nozzle = new THREE.LineSegments(nozzleWire, lineMat);
  const nozzleBaseY = flangeBaseY + FLANGE_H;
  nozzle.position.y = nozzleBaseY + NOZZLE_LEN / 2;
  group.add(nozzle);
  disposers.push(() => nozzleGeom.dispose(), () => nozzleWire.dispose());

  // Invisible hit proxy so the raycaster picks the bottle as a whole.
  const hitGeom = new THREE.CylinderGeometry(0.3, 0.3, 1.6, 12);
  const hitMat = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const hitProxy = new THREE.Mesh(hitGeom, hitMat);
  hitProxy.position.y = 0.7;
  group.add(hitProxy);
  disposers.push(() => hitGeom.dispose(), () => hitMat.dispose());

  return {
    group,
    hitProxy,
    update() {},
    dispose() {
      for (const d of disposers) d();
    },
  };
}

export type TestTubeBuilt = Built & {
  hitProxy: THREE.Mesh;
  /**
   * Liquid surface disc and the world-horizontal clip plane that trims the
   * liquid column. The caller positions/parents the surface and configures the
   * clip plane to taste — see `placeSurfaceInGroup` and `placeSurfaceInWorld`
   * helpers for the two common modes.
   */
  surface: THREE.Mesh;
  clipPlane: THREE.Plane;
  /** Fill height in tube-local Y (before scaling). */
  fillLocalY: number;
  /**
   * Attach the liquid surface as a child of `group` (mini-scene mode). Use
   * when the tube only spins around Y so the disc stays world-horizontal.
   */
  placeSurfaceInGroup: () => void;
  /**
   * Attach the surface to an external host (typically the scene) and pin it
   * at the tube's world fill height (main-scene mode). Call after the tube
   * group has been positioned/scaled. The clip plane is set to the same
   * world Y so the liquid lathe is trimmed flat.
   */
  placeSurfaceInWorld: (host: THREE.Object3D) => void;
};

export function buildTestTube(): TestTubeBuilt {
  const group = new THREE.Group();
  const disposers: Array<() => void> = [];

  const lineMat = new THREE.LineBasicMaterial({
    color: WIRE_COLOR,
    transparent: true,
    opacity: 0.95,
  });
  disposers.push(() => lineMat.dispose());

  const tubeProfile = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.08, 0.02),
    new THREE.Vector2(0.14, 0.08),
    new THREE.Vector2(0.17, 0.18),
    new THREE.Vector2(0.18, 0.28),
    new THREE.Vector2(0.18, 1.15),
    new THREE.Vector2(0.2, 1.2),
    new THREE.Vector2(0.2, 1.25),
  ];
  const bodyGeom = new THREE.LatheGeometry(tubeProfile, 20);
  const bodyWire = new THREE.WireframeGeometry(bodyGeom);
  group.add(new THREE.LineSegments(bodyWire, lineMat));
  disposers.push(() => bodyGeom.dispose(), () => bodyWire.dispose());

  const fillLocalY = 0.25;
  const LIQUID_EXTENDED_TOP = 1.05;
  const liquidProfile = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.07, 0.02),
    new THREE.Vector2(0.13, 0.08),
    new THREE.Vector2(0.16, 0.17),
    new THREE.Vector2(0.172, 0.26),
    new THREE.Vector2(0.172, LIQUID_EXTENDED_TOP),
    new THREE.Vector2(0.0, LIQUID_EXTENDED_TOP),
  ];
  const liquidGeom = new THREE.LatheGeometry(liquidProfile, 20);
  const liquidMat = new THREE.MeshBasicMaterial({
    color: 0xf5da4f,
    transparent: true,
    opacity: 0.45,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const clipPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
  liquidMat.clippingPlanes = [clipPlane];
  liquidMat.clipShadows = false;
  group.add(new THREE.Mesh(liquidGeom, liquidMat));
  const liquidWire = new THREE.WireframeGeometry(liquidGeom);
  const liquidWireMat = new THREE.LineBasicMaterial({
    color: 0xb89a1f,
    transparent: true,
    opacity: 0.65,
  });
  liquidWireMat.clippingPlanes = [clipPlane];
  liquidWireMat.clipShadows = false;
  group.add(new THREE.LineSegments(liquidWire, liquidWireMat));
  disposers.push(
    () => liquidGeom.dispose(),
    () => liquidMat.dispose(),
    () => liquidWire.dispose(),
    () => liquidWireMat.dispose(),
  );

  // Surface disc — built at base scale (caller resizes by scaling the group
  // or by re-scaling on placement).
  const surfaceGeom = new THREE.CircleGeometry(0.172, 24);
  const surfaceMat = new THREE.MeshBasicMaterial({
    color: 0xf5da4f,
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const surface = new THREE.Mesh(surfaceGeom, surfaceMat);
  surface.rotation.x = -Math.PI / 2;
  disposers.push(() => surfaceGeom.dispose(), () => surfaceMat.dispose());

  const hitGeom = new THREE.CylinderGeometry(0.26, 0.26, 1.3, 12);
  const hitMat = new THREE.MeshBasicMaterial({
    visible: false,
    depthWrite: false,
  });
  const hitProxy = new THREE.Mesh(hitGeom, hitMat);
  hitProxy.position.y = 0.6;
  group.add(hitProxy);
  disposers.push(() => hitGeom.dispose(), () => hitMat.dispose());

  let surfaceHost: THREE.Object3D | null = null;

  return {
    group,
    hitProxy,
    surface,
    clipPlane,
    fillLocalY,
    placeSurfaceInGroup() {
      surface.position.set(0, fillLocalY, 0);
      group.add(surface);
      // For in-group mode the clip plane is effectively unused; set it past
      // the visible range so the liquid lathe is shown in full.
      clipPlane.constant = 1e6;
      surfaceHost = group;
    },
    placeSurfaceInWorld(host) {
      // Tube must be positioned/scaled before this is called so we can read
      // its world transform.
      group.updateWorldMatrix(true, false);
      const worldPos = new THREE.Vector3();
      group.getWorldPosition(worldPos);
      const worldScale = new THREE.Vector3();
      group.getWorldScale(worldScale);
      const worldFillY = worldPos.y + fillLocalY * worldScale.y;
      surface.scale.setScalar(worldScale.x);
      surface.position.set(worldPos.x, worldFillY, worldPos.z);
      clipPlane.constant = worldFillY;
      host.add(surface);
      surfaceHost = host;
      disposers.push(() => host.remove(surface));
    },
    update() {},
    dispose() {
      if (surfaceHost && surfaceHost !== group) surfaceHost.remove(surface);
      for (const d of disposers) d();
    },
  };
}
