# What's New — Guides & Videos

Shareable assets documenting the features added this session. All features were
verified by automated browser tests (full-system crawl: 0 errors across all 5 roles).

## Testing guides (one page per feature: screenshot + how-to-test steps)
- `Bassir-Whats-New-Testing-Guide.pdf` — English (for the developer / QA)
- `Bassir-Dalil-Ekhtibar-AR.pdf` — Arabic (العربية)
- `Bassir-Developer-Handoff-Remaining-Work.pdf` — what remains for production (P0/P1/P2)

## Videos (`docs/videos/`)
- `Bassir-Features-Walkthrough.mp4` — end-to-end tour of all new features (Arabic narration)
- `Bassir-BIM-IFC-Demo.mp4` — proof the system reads BIM/IFC: a real IFC downloaded
  from the internet, uploaded, and rendered in 3D inside the Progress Map's BIM tab

## Demo logins (change for production)
| Role | Username | Password |
|---|---|---|
| Owner | `owner` | `owner123` |
| Owner rep | `rep` | `rep123` |
| Consultant | `consultant` | `consult123` |
| Contractor | `cont-arch` | `cont123` |
| Admin | `admin` | `admin123` |

## Features covered
1. Saudi Arabia project map (dashboard + portfolio) — traffic-light, click to open
2. Project coordinates + floor areas (Project Settings)
3. Progress Map renders your real uploaded drawings (faint → bold as BOQ is approved)
4. Each project isolated with its own documents
5. Contractor adds BOQ items manually (file optional)
6. Distribute a whole-project BOQ file across floors (equal / by area / manual / whole)
7. Manual distribution with live "remaining" indicator
8. Project structure by type (building / roads / infrastructure / …)
9. Linear route view for road / infrastructure projects
10. Uploaded drawings & 3D BIM/IFC models viewable in every Progress-Map tab

> Note for the developer: these are in the latest branch — redeploy from the latest
> branch for them to appear on the live site.
