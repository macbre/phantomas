phantomas tests
===============

## Initial set up

We use [`mkcert`](https://github.com/FiloSottile/mkcert) for setting up trusted development certificates to be used when testing locally.

1. Follow [the instruction steps](https://github.com/FiloSottile/mkcert#installation).
2. Run `mkcert -install`
3. Run `./test/ssl-certificate/generate.sh`

## Run the tests

Start the testing server:

```
phantomas$ ./test/server-start.sh
```

And then run the test suite:

```
phantomas$ npm test
```
