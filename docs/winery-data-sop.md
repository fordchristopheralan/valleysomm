Standard Operating Procedure (SOP) for Data Population and Review
Purpose: Ensure all winery data entered via submission forms, admin dashboards, or manual reviews meets high standards of accuracy, consistency, completeness, and timeliness.
Scope: Applies to user submissions, admin edits, bulk imports, and periodic reviews.
1. Data Entry Guidelines (For Forms & Submissions)

Mandatory Fields: name, address, city, state, zip_code, phone, website, latitude/longitude (or auto-geocode from address).
Standardized Picklists: Use dropdowns/multi-select for:
wine_styles, grape_varieties, vibe_tags, best_for, personality_keywords, production_style, food_available, tasting_fee_range, reservation_policy.

Validation Rules:
Auto-format phone/zip/website.
Enforce controlled vocabularies (no free-text for arrays/tags).
Require hours in exact format (e.g., "11am-6pm" or "Closed").
Upload images only from trusted sources; require alt text/credits.

Sources Required: For non-verified submissions, require links to official website/Google/TripAdvisor for verification.

2. Verification Workflow

Initial Submission → Status = 'pending'.
Reviewer Checks:
Cross-verify address/phone/website/hours against official site (primary source).
Geocode address if lat/long missing (use reliable API).
Confirm grape varieties/styles/awards from winery site or recent awards lists.
Check social links work and point to official accounts.
Validate images are current/official (no stolen/stock photos).

Approval Criteria:
90%+ fields complete for core sections.
No contradictions (e.g., "pet-friendly" but pet_notes says "no pets").
Data <12 months old unless marked seasonal.

Set Status → 'approved' + verified = TRUE if confirmed via domain/email/phone.

3. Ongoing Review & Maintenance

Annual Audit: Review all wineries yearly (or when complaints arise) for outdated hours/fees/closures.
Change Monitoring: Subscribe to winery newsletters or watch socials for updates.
User Reports: Allow flagged entries; review within 7 days.
Archiving: If closed >1 year → status = 'archived', active = FALSE.

4. Tools & Best Practices

Primary Sources: Official winery website > VisitYadkinValley.com / NCWine.org > TripAdvisor/Yelp/Google.
Secondary: Recent articles/reviews (post-2024 preferred).
Photos: Prefer official CDN links or winery-provided.
Documentation: Log verification_method and admin_notes for every change.