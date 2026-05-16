# SDK Reference

Shared API client utilities belong in packages.

Primary shared API areas:
- auth helpers
- API clients
- route utilities
- tenant-aware requests
- token handling

Frontend apps should use shared SDK/API clients before creating local fetch wrappers.

Avoid:
- duplicated axios setup
- duplicated auth headers
- hardcoded API URLs
- duplicated tenant-aware request logic