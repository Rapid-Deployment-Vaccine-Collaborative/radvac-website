<?php
/**
 * Plugin Name: Radvac Signups
 * Description: Stores Researchers Map signup form submissions from the Next.js frontend, geocodes coordinates, provides an approval workflow in WP Admin, and exposes approved researchers via a public endpoint.
 * Version: 0.3.0
 * Author: Radvac
 * Requires PHP: 7.4
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Shared secret. MUST match RADVAC_SIGNUP_SECRET in Vercel env vars.
// Define it in wp-config.php (above the "That's all, stop editing!" line):
//   define( 'RADVAC_SIGNUP_SECRET', '<output of: openssl rand -hex 32>' );
function radvac_signup_secret(): string {
    return defined( 'RADVAC_SIGNUP_SECRET' ) ? (string) constant( 'RADVAC_SIGNUP_SECRET' ) : '';
}

add_action( 'init', function () {
    register_post_type( 'researcher_signup', [
        'label'               => 'Researcher Signups',
        'labels'              => [
            'name'                     => 'Researcher Signups',
            'singular_name'            => 'Researcher Signup',
            'add_new'                  => 'Add New Researcher',
            'add_new_item'             => 'Add New Researcher Signup',
            'edit_item'                => 'Review Researcher Signup',
            'new_item'                 => 'New Researcher Signup',
            'view_item'                => 'View Researcher Signup',
            'search_items'             => 'Search Researcher Signups',
            'not_found'                => 'No researcher signups found',
            'not_found_in_trash'       => 'No researcher signups in trash',
            'all_items'                => 'All Signups',
            'menu_name'                => 'Researcher Signups',
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

// Geocode helper for city, state, country via OpenStreetMap Nominatim
function radvac_geocode( $city, $state, $country ) {
    $parts = array_filter( [ $city, $state, $country ] );
    if ( empty( $parts ) ) {
        return null;
    }
    $query = implode( ', ', $parts );
    $url   = 'https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' . rawurlencode( $query );

    $response = wp_remote_get( $url, [
        'timeout'    => 5,
        'user-agent' => 'Radvac-website-geocoder/1.0 (info@radvac.org)',
    ] );

    if ( is_wp_error( $response ) || wp_remote_retrieve_response_code( $response ) !== 200 ) {
        return null;
    }

    $body = wp_remote_retrieve_body( $response );
    $data = json_decode( $body, true );
    if ( empty( $data ) || ! isset( $data[0]['lat'], $data[0]['lon'] ) ) {
        return null;
    }

    return [
        'lat' => (float) $data[0]['lat'],
        'lng' => (float) $data[0]['lon'],
    ];
}

add_action( 'rest_api_init', function () {
    // Shared-secret endpoint: receives new submissions from Next.js
    register_rest_route( 'radvac/v1', '/researcher-signup', [
        'methods'             => 'POST',
        'callback'            => 'radvac_handle_researcher_signup',
        'permission_callback' => function ( WP_REST_Request $request ) {
            $expected = radvac_signup_secret();
            $given    = (string) $request->get_header( 'x-radvac-signup-secret' );
            return strlen( $expected ) >= 32 && $given !== '' && hash_equals( $expected, $given );
        },
    ] );

    // Public endpoint: returns APPROVED (published) researchers to the frontend map
    register_rest_route( 'radvac/v1', '/researchers', [
        'methods'             => 'GET',
        'callback'            => 'radvac_get_approved_researchers',
        'permission_callback' => '__return_true',
    ] );

    // Public health check
    register_rest_route( 'radvac/v1', '/health', [
        'methods'             => 'GET',
        'callback'            => function () {
            return rest_ensure_response( [
                'ok'               => true,
                'secretConfigured' => strlen( radvac_signup_secret() ) >= 32,
                'version'          => '0.3.0',
            ] );
        },
        'permission_callback' => '__return_true',
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

    // Latitude & Longitude (geocoded by Next.js or fallback to WP geocode)
    $lat = $request->get_param( 'lat' );
    $lng = $request->get_param( 'lng' );
    if ( ! is_numeric( $lat ) || ! is_numeric( $lng ) ) {
        $geo = radvac_geocode( $city, $state, $country );
        if ( $geo ) {
            $lat = $geo['lat'];
            $lng = $geo['lng'];
        } else {
            $lat = '';
            $lng = '';
        }
    }

    $lines = [
        'Identifier: ' . $identifier,
        'Email: ' . $email,
        'Location: ' . $city . ', ' . $state . ', ' . $country,
        'Coordinates: ' . ( $lat !== '' ? "$lat, $lng" : 'Not yet geocoded' ),
        'Science degree: ' . ( $science !== '' ? $science : '-' ),
        'Lab skills: ' . ( $skills !== '' ? $skills : '-' ),
        'Lab space/materials: ' . ( $space !== '' ? $space : '-' ),
        'Other info: ' . ( $other !== '' ? $other : '-' ),
        'Security answer (removal verification): ' . $security,
        'Wants Discord invite: ' . $discord,
        'Submitted at: ' . gmdate( 'Y-m-d H:i:s' ) . ' UTC',
    ];

    // Submissions arrive as 'pending' for editorial review.
    // When an admin publishes the post, it appears on the live map.
    $post_id = wp_insert_post( [
        'post_type'    => 'researcher_signup',
        'post_status'  => 'pending',
        'post_title'   => $identifier . ' — ' . $city . ', ' . $country,
        'post_content' => implode( "\n\n", $lines ),
    ], true );

    if ( is_wp_error( $post_id ) ) {
        return new WP_Error( 'radvac_insert_failed', 'Could not save submission.', [ 'status' => 500 ] );
    }

    // Store structured data in post meta
    update_post_meta( $post_id, '_radvac_identifier', $identifier );
    update_post_meta( $post_id, '_radvac_email', $email );
    update_post_meta( $post_id, '_radvac_city', $city );
    update_post_meta( $post_id, '_radvac_state', $state );
    update_post_meta( $post_id, '_radvac_country', $country );
    update_post_meta( $post_id, '_radvac_lat', $lat );
    update_post_meta( $post_id, '_radvac_lng', $lng );
    update_post_meta( $post_id, '_radvac_science', $science );
    update_post_meta( $post_id, '_radvac_skills', $skills );
    update_post_meta( $post_id, '_radvac_space', $space );
    update_post_meta( $post_id, '_radvac_other', $other );
    update_post_meta( $post_id, '_radvac_security', $security );
    update_post_meta( $post_id, '_radvac_discord', $discord );

    return rest_ensure_response( [
        'success' => true,
        'postId'  => $post_id,
        'lat'     => $lat,
        'lng'     => $lng,
    ] );
}

/**
 * Public REST endpoint handler: returns only PUBLISHED (approved) researchers.
 * Never exposes the security question answer or private submission details.
 */
function radvac_get_approved_researchers() {
    $posts = get_posts( [
        'post_type'      => 'researcher_signup',
        'post_status'    => 'publish',
        'numberposts'    => 500,
        'orderby'        => 'date',
        'order'          => 'DESC',
    ] );

    $researchers = [];
    foreach ( $posts as $p ) {
        $lat = get_post_meta( $p->ID, '_radvac_lat', true );
        $lng = get_post_meta( $p->ID, '_radvac_lng', true );

        // If coordinates were not saved in post meta, try fallback to content parse
        if ( ! is_numeric( $lat ) || ! is_numeric( $lng ) ) {
            continue;
        }

        $ident = get_post_meta( $p->ID, '_radvac_identifier', true );
        if ( ! $ident ) {
            $parts = explode( ' — ', $p->post_title );
            $ident = $parts[0] ?: 'Researcher';
        }

        $science = get_post_meta( $p->ID, '_radvac_science', true );
        $skills  = get_post_meta( $p->ID, '_radvac_skills', true );
        $space   = get_post_meta( $p->ID, '_radvac_space', true );
        $notes   = get_post_meta( $p->ID, '_radvac_other', true );

        $researchers[] = [
            'id'            => 'wp-' . $p->ID,
            'name'          => $ident,
            'email'         => (string) get_post_meta( $p->ID, '_radvac_email', true ) ?: undefined,
            'city'          => (string) get_post_meta( $p->ID, '_radvac_city', true ) ?: undefined,
            'state'         => (string) get_post_meta( $p->ID, '_radvac_state', true ) ?: undefined,
            'country'       => (string) get_post_meta( $p->ID, '_radvac_country', true ) ?: undefined,
            'scienceDegree' => $science === 'Yes' ? true : ( $science === 'No' ? false : null ),
            'labSkills'     => $skills === 'Yes' ? true : ( $skills === 'No' ? false : null ),
            'labSpace'      => $space === 'Yes' ? true : ( $space === 'No' ? false : null ),
            'notes'         => $notes ? (string) $notes : null,
            'lat'           => (float) $lat,
            'lng'           => (float) $lng,
        ];
    }

    return rest_ensure_response( $researchers );
}

// -----------------------------------------------------------------------------
// WP Admin Enhancements: Meta Box & Post List Columns
// -----------------------------------------------------------------------------

// Add custom columns to the list table in WP Admin
add_filter( 'manage_researcher_signup_posts_columns', function ( $cols ) {
    $new = [];
    foreach ( $cols as $k => $v ) {
        $new[ $k ] = $v;
        if ( $k === 'title' ) {
            $new['location'] = 'Location';
            $new['coords']   = 'Coordinates';
            $new['email']    = 'Email';
        }
    }
    return $new;
} );

// Populate the custom columns
add_action( 'manage_researcher_signup_posts_custom_column', function ( $column, $post_id ) {
    if ( $column === 'location' ) {
        $city    = get_post_meta( $post_id, '_radvac_city', true );
        $state   = get_post_meta( $post_id, '_radvac_state', true );
        $country = get_post_meta( $post_id, '_radvac_country', true );
        echo esc_html( implode( ', ', array_filter( [ $city, $state, $country ] ) ) ?: '—' );
    } elseif ( $column === 'coords' ) {
        $lat = get_post_meta( $post_id, '_radvac_lat', true );
        $lng = get_post_meta( $post_id, '_radvac_lng', true );
        if ( is_numeric( $lat ) && is_numeric( $lng ) ) {
            $url = 'https://www.openstreetmap.org/?mlat=' . esc_attr( $lat ) . '&mlon=' . esc_attr( $lng ) . '#map=12/' . esc_attr( $lat ) . '/' . esc_attr( $lng );
            printf( '<a href="%s" target="_blank" rel="noopener">%s, %s ↗</a>', esc_url( $url ), esc_html( round( (float) $lat, 4 ) ), esc_html( round( (float) $lng, 4 ) ) );
        } else {
            echo '<span style="color:#d63638;font-weight:600;">⚠ Missing coordinates</span>';
        }
    } elseif ( $column === 'email' ) {
        $email = get_post_meta( $post_id, '_radvac_email', true );
        if ( $email ) {
            printf( '<a href="mailto:%s">%s</a>', esc_attr( $email ), esc_html( $email ) );
        } else {
            echo '—';
        }
    }
}, 10, 2 );

// Add Meta Box for review and coordinate adjustment
add_action( 'add_meta_boxes', function () {
    add_meta_box(
        'radvac_researcher_meta',
        'Researcher Details & Map Pin Location',
        'radvac_render_researcher_meta_box',
        'researcher_signup',
        'normal',
        'high'
    );
} );

function radvac_render_researcher_meta_box( $post ) {
    wp_nonce_field( 'radvac_save_meta', 'radvac_meta_nonce' );

    $ident    = get_post_meta( $post->ID, '_radvac_identifier', true );
    $email    = get_post_meta( $post->ID, '_radvac_email', true );
    $city     = get_post_meta( $post->ID, '_radvac_city', true );
    $state    = get_post_meta( $post->ID, '_radvac_state', true );
    $country  = get_post_meta( $post->ID, '_radvac_country', true );
    $lat      = get_post_meta( $post->ID, '_radvac_lat', true );
    $lng      = get_post_meta( $post->ID, '_radvac_lng', true );
    $science  = get_post_meta( $post->ID, '_radvac_science', true );
    $skills   = get_post_meta( $post->ID, '_radvac_skills', true );
    $space    = get_post_meta( $post->ID, '_radvac_space', true );
    $other    = get_post_meta( $post->ID, '_radvac_other', true );
    $security = get_post_meta( $post->ID, '_radvac_security', true );
    $discord  = get_post_meta( $post->ID, '_radvac_discord', true );
    ?>
    <style>
        .radvac-meta-grid { display: grid; grid-template-columns: 180px 1fr; gap: 12px; align-items: center; margin-bottom: 12px; }
        .radvac-meta-label { font-weight: 600; color: #1d2327; }
        .radvac-meta-box { background: #f6f7f7; border: 1px solid #c3c4c7; padding: 16px; border-radius: 4px; margin-top: 10px; }
    </style>

    <div class="radvac-meta-box">
        <h3 style="margin-top:0;">Submitted Researcher Info</h3>
        <div class="radvac-meta-grid">
            <span class="radvac-meta-label">Identifier:</span>
            <span><strong><?php echo esc_html( $ident ?: '—' ); ?></strong></span>

            <span class="radvac-meta-label">Public Email:</span>
            <span><a href="mailto:<?php echo esc_attr( $email ); ?>"><?php echo esc_html( $email ?: '—' ); ?></a></span>

            <span class="radvac-meta-label">Location:</span>
            <span><?php echo esc_html( implode( ', ', array_filter( [ $city, $state, $country ] ) ) ?: '—' ); ?></span>

            <span class="radvac-meta-label">Science Degree:</span>
            <span><?php echo esc_html( $science ?: '-' ); ?></span>

            <span class="radvac-meta-label">Lab Skills:</span>
            <span><?php echo esc_html( $skills ?: '-' ); ?></span>

            <span class="radvac-meta-label">Lab Space/Materials:</span>
            <span><?php echo esc_html( $space ?: '-' ); ?></span>

            <span class="radvac-meta-label">Other Information:</span>
            <span><?php echo nl2br( esc_html( $other ?: '-' ) ); ?></span>

            <span class="radvac-meta-label">Wants Discord Invite:</span>
            <span><?php echo esc_html( $discord ?: 'No' ); ?></span>

            <span class="radvac-meta-label" style="color:#b32d2e;">Security Answer:</span>
            <span style="color:#b32d2e;font-weight:600;">
                <?php echo esc_html( $security ?: '—' ); ?>
                <span style="font-size:12px;color:#646970;font-weight:normal;">(Private — used only to verify removal requests)</span>
            </span>
        </div>
    </div>

    <div class="radvac-meta-box" style="margin-top:16px;background:#fff;border-left:4px solid #2271b1;">
        <h3 style="margin-top:0;">Map Coordinates</h3>
        <p style="margin-top:0;color:#646970;">These coordinates determine where the pin appears on the 3D globe and world map. They were automatically geocoded upon submission, but you can tweak them here if needed.</p>
        <div class="radvac-meta-grid">
            <label class="radvac-meta-label" for="radvac_lat">Latitude:</label>
            <div>
                <input type="text" id="radvac_lat" name="radvac_lat" value="<?php echo esc_attr( $lat ); ?>" class="regular-text" style="width:200px;" placeholder="e.g. 42.3601" />
            </div>

            <label class="radvac-meta-label" for="radvac_lng">Longitude:</label>
            <div>
                <input type="text" id="radvac_lng" name="radvac_lng" value="<?php echo esc_attr( $lng ); ?>" class="regular-text" style="width:200px;" placeholder="e.g. -71.0589" />
                <?php if ( is_numeric( $lat ) && is_numeric( $lng ) ) : ?>
                    <a href="https://www.openstreetmap.org/?mlat=<?php echo esc_attr( $lat ); ?>&mlon=<?php echo esc_attr( $lng ); ?>#map=12/<?php echo esc_attr( $lat ); ?>/<?php echo esc_attr( $lng ); ?>" target="_blank" rel="noopener" style="margin-left:12px;text-decoration:none;">Preview location on OpenStreetMap ↗</a>
                <?php endif; ?>
            </div>
        </div>
        <p style="margin-bottom:0;">
            <strong>To Approve:</strong> Click standard <strong>"Publish"</strong> on the right. The researcher will appear on the live map immediately.<br>
            <strong>To Reject/Remove:</strong> Move this post to Trash or set it to Draft.
        </p>
    </div>
    <?php
}

// Save adjusted coordinates from the meta box
add_action( 'save_post_researcher_signup', function ( $post_id ) {
    if ( ! isset( $_POST['radvac_meta_nonce'] ) || ! wp_verify_nonce( $_POST['radvac_meta_nonce'], 'radvac_save_meta' ) ) {
        return;
    }
    if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
        return;
    }
    if ( ! current_user_can( 'edit_post', $post_id ) ) {
        return;
    }

    if ( isset( $_POST['radvac_lat'] ) ) {
        $lat = sanitize_text_field( $_POST['radvac_lat'] );
        update_post_meta( $post_id, '_radvac_lat', is_numeric( $lat ) ? (float) $lat : '' );
    }
    if ( isset( $_POST['radvac_lng'] ) ) {
        $lng = sanitize_text_field( $_POST['radvac_lng'] );
        update_post_meta( $post_id, '_radvac_lng', is_numeric( $lng ) ? (float) $lng : '' );
    }
} );
