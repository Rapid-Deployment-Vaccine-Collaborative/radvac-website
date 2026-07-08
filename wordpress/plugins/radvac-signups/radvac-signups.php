<?php
/**
 * Plugin Name: Radvac Signups
 * Description: Stores Researchers Map signup form submissions from the Next.js frontend as private "Researcher Signup" entries, via a shared-secret REST endpoint.
 * Version: 0.1.0
 * Author: Radvac
 * Requires PHP: 7.4
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Shared secret. MUST match RADVAC_SIGNUP_SECRET in Vercel env vars.
// Replace before activating in production.
const RADVAC_SIGNUP_SECRET = 'replace-me-before-activating';

add_action( 'init', function () {
    register_post_type( 'researcher_signup', [
        'label'               => 'Researcher Signups',
        'labels'              => [
            'name'          => 'Researcher Signups',
            'singular_name' => 'Researcher Signup',
        ],
        'public'              => false,
        'show_ui'             => true,
        'show_in_menu'        => true,
        'exclude_from_search' => true,
        'publicly_queryable'  => false,
        'show_in_rest'        => false,
        'menu_icon'           => 'dashicons-groups',
        'supports'            => [ 'title', 'editor' ],
        'capability_type'     => 'post',
        'map_meta_cap'        => true,
    ] );
} );

add_action( 'rest_api_init', function () {
    register_rest_route( 'radvac/v1', '/researcher-signup', [
        'methods'             => 'POST',
        'callback'            => 'radvac_handle_researcher_signup',
        'permission_callback' => function ( WP_REST_Request $request ) {
            $secret = (string) $request->get_header( 'x-radvac-signup-secret' );
            return $secret !== '' && hash_equals( RADVAC_SIGNUP_SECRET, $secret );
        },
    ] );
} );

function radvac_handle_researcher_signup( WP_REST_Request $request ) {
    $identifier = sanitize_text_field( (string) $request->get_param( 'identifier' ) );
    $email      = sanitize_email( (string) $request->get_param( 'email' ) );
    $city       = sanitize_text_field( (string) $request->get_param( 'city' ) );
    $state      = sanitize_text_field( (string) $request->get_param( 'state' ) );
    $country    = sanitize_text_field( (string) $request->get_param( 'country' ) );

    if ( $identifier === '' || $email === '' || $city === '' || $country === '' ) {
        return new WP_Error( 'radvac_invalid', 'Missing required fields.', [ 'status' => 400 ] );
    }

    $science  = sanitize_text_field( (string) $request->get_param( 'scienceDegree' ) );
    $skills   = sanitize_text_field( (string) $request->get_param( 'labSkills' ) );
    $space    = sanitize_text_field( (string) $request->get_param( 'labSpace' ) );
    $other    = sanitize_textarea_field( (string) $request->get_param( 'otherInfo' ) );
    $security = sanitize_text_field( (string) $request->get_param( 'securityQuestion' ) );
    $discord  = $request->get_param( 'wantsDiscord' ) ? 'Yes' : 'No';

    $lines = [
        'Identifier: ' . $identifier,
        'Email: ' . $email,
        'Location: ' . $city . ', ' . $state . ', ' . $country,
        'Science degree: ' . ( $science !== '' ? $science : '-' ),
        'Lab skills: ' . ( $skills !== '' ? $skills : '-' ),
        'Lab space/materials: ' . ( $space !== '' ? $space : '-' ),
        'Other info: ' . ( $other !== '' ? $other : '-' ),
        'Security answer (removal verification): ' . $security,
        'Wants Discord invite: ' . $discord,
        'Submitted at: ' . gmdate( 'Y-m-d H:i:s' ) . ' UTC',
    ];

    $post_id = wp_insert_post( [
        'post_type'    => 'researcher_signup',
        'post_status'  => 'private',
        'post_title'   => $identifier . ' — ' . $city . ', ' . $country,
        'post_content' => implode( "\n\n", $lines ),
    ], true );

    if ( is_wp_error( $post_id ) ) {
        return new WP_Error( 'radvac_insert_failed', 'Could not save submission.', [ 'status' => 500 ] );
    }

    return rest_ensure_response( [ 'success' => true ] );
}
