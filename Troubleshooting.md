Troubleshooting
===============

## Debugging

Before reporting an issue please run phantomas in verbose and debug mode:

```
DEBUG=* phantomas "http://example.com" --verbose
```

and provide the output via gist link.

## phantomas fails to load HTTPS site

```
phantomas: (254) Page loading failed
```

**Solution**: Try providing ``--ssl-protocol=tlsv1`` or ``--ssl-protocol=any`` option.
