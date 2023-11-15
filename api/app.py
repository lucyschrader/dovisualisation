from flask import Flask, render_template, session, redirect, url_for, request, g
import csv
from api import auth

app = Flask(__name__)
app.config.from_mapping(
	SECRET_KEY='dev'
)

app.register_blueprint(auth.bp)

data = {}


def format_data(row):
	for field in row.keys():
		if "|" in row[field]:
			row[field] = row[field].split("|")


with open("api/static/data/platforms.csv", newline="", encoding="utf-8") as f:
	platforms = csv.DictReader(f, delimiter=",")
	for row in platforms:
		format_data(row)
		data.update({row["slug"]: row})


@app.route("/")
@auth.auth_required
def index():
	return render_template("home.html")


@app.route("/platforms")
def view_table():
	return render_template("platformtable.html")


@app.route("/getplatformslugs")
def get_platform_slugs():
	slugs = list(data.keys())
	return slugs


@app.route("/icon/<slug>")
def generate_platform_icon(slug):
	platform = data.get(slug)
	if platform:
		html = render_template("platformicon.html", platform=platform)
		proximity = platform["proximity"]
		return {"html": html, "proximity": proximity}

	return None


@app.route("/platform/<slug>")
def generate_platform_block(slug):
	if slug == "default":
		html = render_template("defaultinfo.html")
	else:
		platform = data.get(slug)
		if platform:
			html = render_template("platformdetails.html", platform=platform)
		else:
			html = render_template("defaultinfo.html")
	return {"html": html}


if __name__ == "__main__":
	app.run()
