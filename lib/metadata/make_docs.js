/**
 * Generates Markdown files in /docs directory
 */
const debug = require('debug')('docs'),
    fs = require('fs'),
    metadata_file = __dirname + '/metadata.json',
    docs_dir = fs.realpathSync(__dirname + '/../../docs'),
    github_root = "https://github.com/macbre/phantomas/tree/devel";
    
debug('Generating docs into %s ...', docs_dir);
debug('Reading %s ...', metadata_file);

const metadata = JSON.parse(fs.readFileSync(metadata_file));

// console.log(metadata);

const docs_notice = "\n\n---\n> This file is auto-generated from code comments. Please run `npm run make-docs` to update it."

/**
 * events.md
 * 
 * https://github.com/macbre/phantomas/issues/729
 */
var events = `
Events
======

`

Object.keys(metadata.events).sort().forEach(eventName => {
    const entry = metadata.events[eventName];

    events += `
## ${eventName}

**Description**: ${entry.desc}

**Arguments**: ${entry.arguments}

[View source](${github_root}${entry.file})

`.trim()

    events += "\n\n\n";
});

fs.writeFileSync(docs_dir + '/events.md', events.trim() + docs_notice);

// ---
debug('Done');
