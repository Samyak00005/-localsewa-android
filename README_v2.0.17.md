# Localsewa Android v2.0.17 — Final Palette Migration Hotfix

Apply this hotfix over v2.0.16.

## Scope
Color-token migration only. No layout, route, backend contract, or interaction changes are intended.

## Final Customer palette
- Text: #102018
- Background: #F7FAF8
- Primary: #0F8449
- Primary dark: #092C20
- Secondary: #DCEFE4
- Accent: #20A85A
- Header: #1AA25A

## Final Provider palette
- Text: #101B1A
- Background: #F0F5F3
- Primary: #145E3B
- Primary dark / pressed: #0E3024
- Secondary: #D7E3DF
- Accent: #214035
- Header: #145E3B
- Subtle: #EEF4F1

## Shared semantic colors
- Success: #15803D
- Rating: #F5A623
- Danger: #B42318
- Info: #2457C5

## Localsewa+
Localsewa+ remains an entitlement layer over the Provider palette. Premium gold/aubergine/ivory values are unchanged and remain restricted to premium membership indicators/surfaces.

## Migration details
- Customer header/home green now derives from the final Customer header token.
- Customer call-preview deep surface now derives from Customer primary-dark.
- Rating stars use the shared rating token instead of scattered literals.
- Booking semantic info/success/danger/warning text colors use shared semantic tokens.
- Provider header/navigation/background update automatically through the Provider theme.
- Provider review rating stars now use the shared rating token.
- Provider media empty-state secondary icons now derive from the active Provider theme.
- Provider notification danger badge now derives from the shared danger token.

## Version
- versionName: 2.0.17
- versionCode: 20017
