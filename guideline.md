# Admit-EU → WordPress Conversion Guideline

This is a step-by-step reference for converting the static HTML site (`index.html`, `about.html`, `blog.html`, `team.html`) into a WordPress theme with dynamic (admin-editable) content. It does not implement anything — follow it in order when you're ready to build.

Recommended plugin: **Advanced Custom Fields (ACF)** — free version is enough for everything below. Install it first; almost every "dynamic" section depends on it.

---

## 1. Pages inventory

| File              | Becomes                                       | Notes                                                                                 |
| ----------------- | --------------------------------------------- | ------------------------------------------------------------------------------------- |
| `index.html`      | `front-page.php`                              | Home page                                                                             |
| `about.html`      | `page-about.php` (or a Page template `About`) | Static-ish content page                                                               |
| `team.html`       | `page-team.php` (or a Page template `Team`)   | Team members grid                                                                     |
| `blog.html`       | `home.php` (blog index)                       | This should become the **native WordPress post list**, not a custom template — see §5 |
| shared `<header>` | `header.php`                                  | Identical on all 4 pages                                                              |
| shared `<footer>` | `footer.php`                                  | Identical on all 4 pages                                                              |

Everything between `<header>` and `<footer>` in each file becomes that page's own template file, using `get_header()` / `get_footer()`.

---

## 2. Base theme setup (do this first)

1. Create `wp-content/themes/admit-eu/` with:
   - `style.css` (theme header comment block required by WP)
   - `functions.php`
   - `header.php`, `footer.php`
   - `front-page.php`, `page-about.php`, `page-team.php`, `home.php`, `single.php` (for individual blog posts)
   - `screenshot.png` (optional)
2. Copy the `assets/` folder as-is into the theme root.
3. In `functions.php`:
   - `add_theme_support('title-tag')`
   - `add_theme_support('post-thumbnails')` (needed for blog featured images)
   - Register two menu locations: `primary` (header nav) — the footer link columns are **not** `wp_nav_menu` candidates because they're three separate lists (see §4), so only one location is needed unless you want to manage footer columns as menus too (recommended, see §4).
   - Enqueue all CSS/JS from `assets/` via `wp_enqueue_style` / `wp_enqueue_script` with proper handles and dependencies (jQuery → bootstrap → meanmenu → swiper → magnific-popup → select2 → script.js). Use `get_template_directory_uri()` for paths instead of the relative `assets/...` paths currently in the HTML.
   - Note: `select2` and its CSS are loaded from a CDN (`cdn.jsdelivr.net`) in the raw HTML — keep those as external enqueues, or download and self-host them in `assets/` for reliability.
4. Replace `<title>Admit-EU Education Consulancy Website</title>` with `wp_head()` output (remove the hardcoded tag, WP injects title via `title-tag` support).
5. Replace the favicon `<link>` with the WP Site Icon (Settings → General) — remove the hardcoded line.

---

## 3. Header (`header.php`)

Source: identical block at the top of all 4 files (lines ~32–98 in each).

- Logo image → use `custom_logo` (Appearance → Customize → Site Identity) via `the_custom_logo()`, or a theme option/ACF Options field if you want a dedicated "header logo" separate from the WP default.
- Nav menu (`about us`, `Destinations` dropdown, `Course finder`, `Services` dropdown, `Resources` dropdown, `Events`, `Book free counselling`) → replace the entire hardcoded `<ul>` with:
  ```php
  wp_nav_menu([
    'theme_location' => 'primary',
    'container'      => false,
    'menu_class'     => '',
    'items_wrap'     => '<ul>%3$s</ul>',
  ]);
  ```
- Build the actual menu once in **Appearance → Menus**, assign it to "Primary", and recreate the dropdown structure there (WP natively nests sub-items as `<ul>` inside `<li>`, matching this theme's existing CSS/JS for the mega-dropdown and mobile "meanmenu").
- This single change makes navigation editable site-wide without touching code, and automatically keeps it in sync across all pages since `header.php` is shared.

---

## 4. Footer (`footer.php`)

Source: identical block at the bottom of all 4 files.

- Logo + description paragraph → ACF Options Page fields (`footer_logo`, `footer_description`) or Customizer settings. These rarely change, so a single global settings screen is enough.
- Three link columns (`Destinations`, `Quick links`, `Company`) → register **three more menu locations** (`footer-destinations`, `footer-quick-links`, `footer-company`) and output each with `wp_nav_menu()`, styled with the existing `.footer-common-links` markup via `menu_class`/`items_wrap`. This lets an editor add/remove/reorder footer links from Appearance → Menus instead of editing PHP.
- Copyright year — already scripted via `#copyright-year`; just keep `script.js`'s logic, or replace with `<?php echo esc_html( date( 'Y' ) ); ?>` directly in `footer.php` for reliability without JS.

---

## 5. Home page (`front-page.php`) — source: `index.html`

| Section                                                                                                                              | Markup source | WP mechanism                                                                                                                                                                                                                                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------ | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Hero slider (`.home-slider-main`) — 2 slides: 1 image+text, 1 video+text                                                             | lines 104–158 | CPT `slide` (or ACF Repeater on the front page if slides never need individual URLs). Fields: `slide_type` (image/video), `background_image`, `background_video`, `heading`, `description`, `button_text`, `button_url`. Loop into the swiper `.swiper-wrapper`.                                                                                             |
| Course/University search tabs (`.course-uni-filter-main`)                                                                            | lines 163–250 | Dropdown options ("Undergraduate/Postgraduate/PhD", "Business/Computer Science/Engineering") → WP **Taxonomies** (`study_level`, `subject_area`) so the same terms can tag actual `course`/`university` posts later. Populate `<select>` via `get_terms()`.                                                                                                  |
| "Why choose the UK" tabs (`.why-choose-uk-main`) — 3 tabs, each image + heading + 2 paragraphs                                       | lines 258–373 | ACF **Flexible Content** or **Repeater** field on the front page itself (`why_choose_tabs`: repeater of `tab_title`, `tab_image`, `tab_content`). Loop to generate both the tab buttons and tab panes with matching IDs.                                                                                                                                     |
| World-class universities cards (`.world-class-main`) — repeating card: logo, name, location, ranking, next intake, entry score, link | lines 377–507 | CPT `university`. Fields: `logo`, `location`, `ranking`, `next_intake`, `entry_score`. Front page query: `WP_Query` with `posts_per_page => 3`, ordered by a `featured` checkbox or `menu_order`. "View all universities" link → archive page `/university/`.                                                                                                |
| Student testimonials slider (`.hear-students-main`) — video/photo + name + short line                                                | lines 513–578 | CPT `testimonial`. Fields: `photo_or_video`, `student_name`, `short_quote`. Loop into `.hear-students-slider`.                                                                                                                                                                                                                                               |
| University fairs / events (`.univarsity-fair-main`) — filters + repeating event card                                                 | lines 583–731 | CPT `event`. Fields: `event_type` (in-person/online — taxonomy or select), `event_date`, `event_time`, `location`, `thumbnail`. Month/Location filter dropdowns should be generated dynamically from actual event post data (`get_terms()` or distinct meta values), not hardcoded "One/Two/Three" placeholders. "View all events" → archive page `/event/`. |
| FAQ accordion (`.faq-main`)                                                                                                          | lines 734–812 | CPT `faq` (simple: title = question, content/ACF field = answer) or an ACF Repeater directly on the front page if FAQs are homepage-only. Loop to build `.single-accordion-wrapper` blocks.                                                                                                                                                                  |

---

## 6. About page (`page-about.php`) — source: `about.html`

| Section                                                                                    | Markup source | WP mechanism                                                                                                                                                       |
| ------------------------------------------------------------------------------------------ | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Banner heading + paragraph (`.about-banner-main`)                                          | lines 102–121 | Native Page title (`the_title()`) + Page content (`the_content()`), or dedicated ACF fields if you want the heading/paragraph separate from the main WYSIWYG body. |
| Mission / Vision (`.vision-main`)                                                          | lines 125–161 | ACF Repeater `mission_vision_items` (fields: `label`, `text`) — only 2 rows today but a repeater lets you add more without a template change.                      |
| "Our journey" timeline slider (`.our-journey-main`) — repeating year + heading + paragraph | lines 167–287 | ACF Repeater `journey_milestones` (fields: `year`, `heading`, `description`). Loop into `.our-journey-desktop-slider`.                                             |
| "What we do" grid (`.what-wedo-main`) — repeating icon + title + description               | lines 293–366 | ACF Repeater `what_we_do_items` (fields: `icon`, `title`, `description`).                                                                                          |

All of these can live as ACF field groups assigned to "Page: About" specifically (Location rule: `Page = About`), edited from the normal WP page editor — no CPT needed since there's only ever one About page.

---

## 7. Team page (`page-team.php`) — source: `team.html`

| Section                                                         | Markup source | WP mechanism                                                                                                                                                                                                                                   |
| --------------------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Banner heading + paragraph                                      | lines 102–121 | Page title + content, same as About.                                                                                                                                                                                                           |
| Executive team grid — repeating photo, name, role, social links | lines 124–326 | CPT `team_member`. Fields: `photo`, `role_title`, `facebook_url`, `linkedin_url`, `twitter_url`. Query all (or a `display_order` field) into `.we-grid-parent`-style loop.                                                                     |
| CEO quote block (`.ceo-box-flex`)                               | lines 329–343 | Single ACF field group (not a CPT — only one quote): `quote_photo`, `quote_text`, `quote_name`, `quote_title`. Could also just be a "featured" checkbox on one `team_member` post so it's pulled from the same CPT instead of duplicated data. |

---

## 8. Blog page (`home.php`) — source: `blog.html`

This page is the odd one out: it's a plain repeating card list (date, title, excerpt, "Read more") — exactly what WordPress's **native Post system** already does. Do **not** build a custom CPT for this.

- Set **Settings → Reading → "Your homepage displays" → Posts page** to a page using `home.php` (or just let `home.php` be the default blog index if `front-page.php` handles the real homepage — WP supports both simultaneously: `front-page.php` for `/`, `home.php` for the designated posts page, e.g. `/blog/`).
- Loop standard `WP_Query`/the Loop:
  - `.date` → `get_the_date()`
  - `h3` title → `the_title()`
  - `p` excerpt → `the_excerpt()` (set excerpt length via `excerpt_length` filter to match the current ~2-line trim)
  - "Read more" → `the_permalink()`
- Add pagination (`the_posts_pagination()`) since 8 static cards today will grow into many real posts.
- Individual post pages need `single.php` — not present in the static HTML, so design it fresh (reuse `.blog-single-card` styling patterns, header/footer, and a simple content column).
- Category/tag filters can be layered on later using native WP categories if needed — nothing in the current markup requires it yet.

---

## 9. Build order (recommended)

1. Scaffold theme, header.php, footer.php, enqueue assets (§2–4).
2. Menus: primary nav + 3 footer menus. Verify header/footer look identical to the static site on a blank page.
3. Blog (§8) — easiest since it's native Posts, validates the loop/pagination pattern early.
4. Team (§7) — first CPT (`team_member`), validates ACF + CPT workflow.
5. About (§6) — page-specific ACF field groups, no CPT.
6. Home (§5) — most complex page, do last once CPT/ACF patterns (`university`, `event`, `testimonial`, `slide`, `faq`) are proven from steps 3–5.
7. Build the 4 archive pages the home page links out to: `/university/`, `/event/`, plus any `/team/` or blog category archives you want browsable.

---

## 10. Plugins checklist

- **Advanced Custom Fields (ACF)** — required for nearly every field group and repeater above.
- **Custom Post Type UI** (optional) — alternative to registering CPTs in `functions.php` if you'd rather manage them from wp-admin instead of code.
- No page builder (Elementor/Divi) needed — the existing Bootstrap/Swiper markup and CSS are hand-built and portable directly into PHP templates.
