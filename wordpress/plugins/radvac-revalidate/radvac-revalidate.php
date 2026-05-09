<?php
/**
 * Plugin Name: RaDVaC Revalidate
 * Description: Notifies the Next.js frontend (Vercel) when WordPress content changes, so pages refresh out of the ISR cache immediately.
 * Version: 0.1.0
 * Author: RaDVaC
 * Requires PHP: 7.4
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Public URL of the Next.js frontend that exposes /api/revalidate.
const RADVAC_FRONTEND_URL = 'https://radvac.org';

// Path of the revalidation endpoint on the frontend.
const RADVAC_REVALIDATE_PATH = '/api/revalidate';

// Shared secret. MUST match REVALIDATE_SECRET in Vercel env vars.
// Replace before activating in production.
const RADVAC_REVALIDATE_SECRET = '2d435c8007efed4d3e8ae17e27c25787438f952907bef62632f74f6185776ece';

function radvac_notify_frontend( $post_id, $post = null ) {
    if ( wp_is_post_revision( $post_id ) || wp_is_post_autosave( $post_id ) ) {
        return;
    }

    $post = $post ?: get_post( $post_id );
    if ( ! $post || $post->post_status !== 'publish' ) {
        return;
    }

    wp_remote_post(
        RADVAC_FRONTEND_URL . RADVAC_REVALIDATE_PATH,
        [
            'timeout'  => 5,
            'blocking' => false,
            'headers'  => [ 'Content-Type' => 'application/json' ],
            'body'     => wp_json_encode( [
                'secret'   => RADVAC_REVALIDATE_SECRET,
                'slug'     => $post->post_name,
                'postType' => $post->post_type,
            ] ),
        ]
    );
}

add_action( 'save_post', 'radvac_notify_frontend', 10, 2 );

add_action(
    'transition_post_status',
    function ( $new, $old, $post ) {
        if ( $new === 'publish' || $old === 'publish' ) {
            radvac_notify_frontend( $post->ID, $post );
        }
    },
    10,
    3
);
