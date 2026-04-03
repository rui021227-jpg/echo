# ECHO Privacy Policy

Static page hosted on Vercel. Deploy with:

```bash
cd privacy-policy
npx vercel --prod
```

Vercel will give you a URL like `echo-privacy.vercel.app`. Then set:

```
EXPO_PUBLIC_PRIVACY_POLICY_URL=https://echo-privacy.vercel.app
```

In both your local `.env` and as an EAS secret:

```bash
eas secret:create --scope project --name EXPO_PUBLIC_PRIVACY_POLICY_URL --value "https://echo-privacy.vercel.app"
```

The page is self-contained — no build step, no dependencies.
