# 06 Measurement Plan

Do not send personal data, message content, phone numbers entered by users, hearing-test answers, or suspected health conditions to analytics vendors.

| Event | Trigger | Business meaning | Context | Parameters | Privacy | Status |
| --- | --- | --- | --- | --- | --- | --- |
| `appointment_cta_click` | Booking CTA click | Appointment intent | All pages | `page_path`, `cta_label` | No PII | Recommended |
| `appointment_form_start` | First booking form interaction | Funnel start | `/zakazivanje` | `branch_slug` if selected | No name/phone | Recommended |
| `appointment_form_submit_success` | Successful booking action | Lead | `/zakazivanje` | `branch_slug`, `source_page` | No form content | Needs hook |
| `phone_click` | `tel:` link click | Call intent | Header/footer/branch/contact | `location_slug`, `context` | Business phone only | Recommended |
| `directions_click` | Maps/directions click | Visit intent | Branch pages | `branch_slug` | No PII | After maps URLs |
| `contact_form_submit_success` | Contact success | Lead | `/kontakt` | `branch_slug`, `form_type` | No message/name/phone | Needs hook |
| `online_test_start` | Start test | Tool engagement | `/online-test-sluha` | `test_version` | No answers | Recommended |
| `online_test_complete` | Result shown | High intent | `/online-test-sluha` | approved non-sensitive bucket only | Needs privacy review | Recommended |
| `online_test_booking_click` | Result CTA | Assisted conversion | `/online-test-sluha` | `branch_slug` | No answers | Recommended |
| `product_enquiry_click` | Product/category CTA | Product demand | Product pages | `product_slug`, `category` | No PII | Recommended |
| `branch_selector_change` | Branch selected | Local demand | Forms/tools | `branch_slug` | No PII | Recommended |
| `faq_expand` | FAQ opened | Content usefulness | FAQ/service/home | `topic` | No PII | Optional |
| `gbp_utm_visit` | GBP UTM landing | GBP traffic | Any landing page | UTM parameters | Standard campaign data | Reporting task |

Plausible and GA4 IDs are CMS-configurable. Do not alter analytics accounts without explicit authorization.
