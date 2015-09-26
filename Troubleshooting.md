Troubleshooting
===============

## phantomas fails to load HTTPS site

```
phantomas: (254) Page loading failed
```

**Solution**: Try providing ``--ssl-protocol=tlsv1`` or ``--ssl-protocol=any`` option.

**Solution**: Try [running phantomas using PhantomJS 2.0](https://github.com/macbre/phantomas#engines) via ``--engine=webkit2`` option.
