Troubleshooting
===============

## Fixing "No usable sandbox"

So you want to run `phantomas` and get the following error:

```
Error: Failed to launch the browser process!
[0807/192619.437769:FATAL:zygote_host_impl_linux.cc(117)] No usable sandbox! Update your kernel or see https://chromium.googlesource.com/chromium/src/+/master/docs/linux/suid_sandbox_development.md for more information on developing with the SUID sandbox. If you want to live dangerously and need an immediate workaround, you can try using --no-sandbox.
```

Run the following as `root`:

```
echo kernel.unprivileged_userns_clone=1 > /etc/sysctl.d/00-local-userns.conf
service procps restart
```

> See https://github.com/iridium-browser/tracker/issues/208#issuecomment-450572959 for more details. 

### When running inside a Docker container

Please refer to https://github.com/Zenika/alpine-chrome#-the-best-with-seccomp.

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
