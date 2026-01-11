# DwellTime Documentation

This folder contains all project documentation.

## Documents

| File | Description |
|------|-------------|
| `PRD.md` | Product Requirements Document |
| `SRS.md` | Software Requirements Specification |
| `API.md` | API Specification |
| `UI_DESIGN.md` | UI/UX Design Document |
| `IMPLEMENTATION_PLAN.md` | Detailed implementation plan |

## Adding Documents

Copy your existing documentation files to this folder:

```bash
# Example commands
cp DwellTime_PRD_v2.md docs/PRD.md
cp DwellTime_SRS_Document.md docs/SRS.md
cp DwellTime_API_Specification.md docs/API.md
cp DwellTime_UI_Design_Document.md docs/UI_DESIGN.md
```

## Quick Reference

### Key Configurations (from PRD)
- **Default Hourly Rate**: $75/hr
- **Default Grace Period**: 120 minutes (2 hours)
- **GPS Log Interval**: 5 minutes
- **Geofence Radius**: 200m (configurable 100-500m)
- **Free Tier**: 3 events/month, 5 photos/event
- **Pro Tier**: Unlimited events, 10 photos/event

### Tech Stack
- **Frontend**: React Native (Expo SDK 54)
- **Backend**: Supabase (Auth, Postgres, Edge Functions)
- **Storage**: Cloudflare R2
- **Caching**: Upstash Redis
- **Payments**: Stripe
