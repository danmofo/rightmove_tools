# Rightmove tools

**Disclaimer: I don't write a lot of NodeJS code. These are poorly written scripts I wrote by throwing together random crap from Google searches. It is in no way an example of "good" Node/JS code or good code in general.**

This project contains two tools:
- `rightmove-alerter`, scrapes the data from a list of specified rightmove.co.uk searches and sends an email notification when new properties appear. Note that this excludes "featured" properties.
- `image-analyser`, downloads images from a specific Rightmove listing and prints information in the console about them. This is useful if you're interested in when the pictures from a listing were taken. Note that not all images contain this metadata, so it will look like the images were taken today even if they're old. I can't do anything about this.

## Motivation

I am looking to move into a new place, but I don't know where I want to live. So I went onto rightmove.co.uk and created a search covering a large
region of England/Wales. For some reason property alerts do not work on these searches, so I would have to constantly refresh the search during work
and save the link on my phone when I'm out and hit refresh periodically.

This is crap and annoying, and takes my attention away from whatever I'm working on, so I decided to try and automate it myself.

## Usage

Requirements:
- `imagemagick` installed on the host machine.
- `NodeJS 11+`

Firstly run `npm install` to get all of the reqired dependencies, then run one of the two commands below.

### rightmove-alerter

1. Copy `.env.template` to `.env` and fill in the values.
2. Edit `config.js`:
	- `SEARCHES`, add your searches to this list - the main bit is `url`. To get this, go to https://www.rightmove.co.uk and make a search with your filters applied then copy the URL. It should look like: `https://www.rightmove.co.uk/property-to-rent/find.html?....`
3. Run `./rightmove-alerter` and wait.

If you don't want to periodically poll and just want all the data in a table, you can run `node property-alerter.js --full`. Note that this nmethod will not send any notification emails.

### image-analyser

1. Run `./image-analyser <rightmove_property_id>`.

## Limitations
- If a property gets updated in any way, it will NOT update the existing row. It will only add new rows. I'm not quite sure if updated results get bumped to the first page or not, for example when the price gets reduced.

## TODO
- Allow rightmove property URL instead of ID only for `image-analyser`