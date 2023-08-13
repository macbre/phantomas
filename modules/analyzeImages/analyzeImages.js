/**
 * Adds Responsive Images metrics using analyze-images npm module.
 *
 * Run phantomas with --analyze-images option to use this module
 */
"use strict";

module.exports = function (phantomas) {
  phantomas.setMetric("imagesWithoutDimensions"); // @desc number of <img> nodes without both width and height attribute @offenders
  phantomas.setMetric("imagesNotOptimized"); // @desc number of loaded images that could be lighter it optimized @offenders
  phantomas.setMetric("imagesScaledDown"); // @desc number of loaded images scaled down when displayed @offenders
  phantomas.setMetric("imagesOldFormat"); // @desc number of loaded images that could benefit from new generation formats (WebP or AVIF) @offenders
  phantomas.setMetric("imagesExcessiveDensity"); // @desc number of images that could be served smaller as the human eye can hardly see the difference @offenders
  phantomas.setMetric("imagesWithIncorrectSizesParam"); // @desc number of responsive images with an improperly set sizes parameter @offenders

  if (phantomas.getParam("analyze-images") !== true) {
    phantomas.log(
      "To enable images in-depth metrics please run phantomas with --analyze-images option"
    );
    return;
  }

  const analyzer = require("analyze-image");
  phantomas.log("Using version %s", analyzer.version);

  async function analyzeImage(body, context) {
    phantomas.log("Starting analyze-image on %j", context);
    const results = await analyzer(body, context, {});
    phantomas.log("Response from analyze-image: %j", results);

    for (const offenderName in results.offenders) {
      phantomas.log("Offender %s found: %j", offenderName, results.offenders[offenderName]);
      
      const newOffenderName = offenderName.replace("image", "images");
      phantomas.incrMetric(newOffenderName);
      phantomas.addOffender(newOffenderName, {
        url: context.url || shortenDataUri(context.inline),
        ...results.offenders[offenderName],
      });
    }
  }

  // prepare a list of images (both external and inline)
  const images = [];

  phantomas.on("recv", async (entry, res) => {
    if (entry.isImage) {
      images.push({
        contentPromise: res.getContent, // defer getting the response content
        url: entry.url,
        htmlTags: []
      });
    }
  });

  phantomas.on("base64recv", async (entry) => {
    if (entry.isImage) {

      images.push({
        inline: entry.url,
        htmlTags: []
      });
    }
  });

  phantomas.on("imgtag", (context) => {
    phantomas.log("Image tag found: %j", context);

    // If we previously found a network/inline request that matches the currentSrc, attach tag to it.
    const correspondingResp = images.find((resp) => resp.url === context.currentSrc || resp.inline === context.currentSrc);
    if (correspondingResp) {
      phantomas.log("Attached to previously found network image %s", correspondingResp.url || '[inline]');
      correspondingResp.htmlTags.push(context);
    } else {
      phantomas.log("Can't attach to previously found network image");
    }
  });

  // ok, now let's analyze the collected images
  phantomas.on("beforeClose", () => {
    const promises = [];

    images.forEach((entry) => {
      promises.push(
        new Promise(async (resolve) => {
          phantomas.log("Analyzing %s", entry.url || "inline image");
          let imageBody;

          if (entry.inline) {
            imageBody = extractImageFromDataUri(entry.inline);
          }
          
          if (entry.contentPromise) {
            imageBody = await entry.contentPromise();
          }

          if (imageBody && imageBody.length > 0) {
            // If several img tags use the same source, then we only treat the largest one
            // (because it's not a perf issue when an image is re-used on the page on a smaller size)
            let largestTag;

            entry.htmlTags.forEach((tag) => {
              if (!largestTag || tag.displayWidth * tag.displayHeight > largestTag.displayWidth * largestTag.displayHeight) {
                largestTag = tag;
              }
            });

            await analyzeImage(imageBody, {
              url: entry.url,
              inline: entry.inline,
              ...largestTag
            });
          }

          resolve();
        })
      );
    });

    return Promise.all(promises);
  });

  function extractImageFromDataUri(str) {
    const result = str.match(/^data:image\/[a-z+]*(?:;[a-z0-9]*)?,(.*)$/);
    if (result) {
      // Inline SVGs might be urlencoded
      if (str.startsWith("data:image/svg+xml") && str.includes("%3Csvg")) {
        return decodeURIComponent(result[1]);
      }
      return result[1];
    }
    return null;
  }

  function shortenDataUri(str) {
    if (str.length > 100) {
      return str.substring(0, 50) + " [...] " + str.substring(str.length - 50);
    }
    return str;
  }
};
