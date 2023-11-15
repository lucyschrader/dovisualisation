"use strict";

let proximityBlock
let proximity1
let proximity2
let proximity3

let prox1count = 0
let prox2count = 0
let prox3count = 0

let platformTriggers = []
let infoBlock

window.addEventListener("load", () => {
	proximityBlock = document.getElementById("proximity")
	proximity1 = document.getElementById("prox-list-1")
	proximity2 = document.getElementById("prox-list-2")
	proximity3 = document.getElementById("prox-list-3")

	// Place default info panel text
	infoBlock = document.getElementById("info-block")
	triggerPlatformText("default")

	// Set up icons and triggers
	setUpIcons()

	// Add reset trigger to banner
	let banner = document.getElementById("banner")
	banner.addEventListener("click", () => triggerPlatformText("default"))
})

async function setUpIcons() {
	const slugs = await getPlatformNames()
	for (let i = 0; i < slugs.length; i++) {
		let slug = slugs[i]
		await placePlatformIcon(slug)
	}

	for (let i = 0; i < slugs.length; i++) {
		let slug = slugs[i]
		createTrigger(slug)
	}

	createCircleDisplay()
}

async function getPlatformNames() {
	try {
		const response = await fetch("/getplatformslugs")
		return response.json()
	}
	catch (error) {
		console.error("Failure in getPlatformNames: ", error.message, error.stack)
		return []
	}
}

async function placePlatformIcon(slug) {
	try {
		let response = await fetch("/icon/" + slug)
		let respJson = await response.json()
		let platformHtml = respJson["html"]
		let platformProximity = parseInt(respJson["proximity"])

		switch (platformProximity) {
			case 1:
				proximity1.insertAdjacentHTML("beforeend", platformHtml)
				prox1count += 1
				applyIconStyle(slug, prox1count)
				break
			case 2:
				proximity2.insertAdjacentHTML("beforeend", platformHtml)
				prox2count += 1
				applyIconStyle(slug, prox2count)
				break
			case 3:
				proximity3.insertAdjacentHTML("beforeend", platformHtml)
				prox3count += 1
				applyIconStyle(slug, prox3count)
				break
		}
	}
	catch (error) {
		console.error("Failure in placePlatformIcon: ", error.message, error.stack)
		return slug
	}
}

function applyIconStyle(slug, proxCount) {
	let platformElementId = slug + "-icon"
	let platformIconDiv = document.getElementById(platformElementId)
	platformIconDiv.setAttribute("style", "--i:" + proxCount)
}

function createTrigger (slug) {
	let platformElementId = slug + "-icon"
	let platformTrigger = document.getElementById(platformElementId)
	platformTrigger.addEventListener('click', () => triggerPlatformText(slug))
}

async function triggerPlatformText(slug) {
	let response = await fetch("/platform/" + slug)
	let respJson = await response.json()
	let platformInfoHtml = respJson["html"]

	infoBlock.innerHTML = platformInfoHtml

	if (slug != "default") {
		setCloseTrigger()
		switchHighlights(slug)
	} else {
		resetHighlights()
	}
}

function setCloseTrigger() {
	let closePanelButton = document.getElementById("close-panel")
	closePanelButton.addEventListener('click', () => triggerPlatformText("default"))
}

function createCircleDisplay() {
	proximity1.setAttribute("style", "--total: " + prox1count)
	proximity1.classList.add("circle")
	proximity2.setAttribute("style", "--total: " + prox2count)
	proximity2.classList.add("circle")
	proximity3.setAttribute("style", "--total: " + prox3count)
	proximity3.classList.add("circle")

	let allIcons = document.querySelectorAll("div.platform-icon")
	allIcons.forEach((icon) => {
		icon.classList.add("icon")
	})
}

function switchHighlights(slug) {
	highlightPlatform(slug)
	lowlightPlatforms(slug)
}

function highlightPlatform(slug) {
	let activePlatformIcon = document.getElementById(slug + "-image")
	activePlatformIcon.classList.add("icon-highlight")
	activePlatformIcon.classList.remove("icon-lowlight")
}

async function lowlightPlatforms(slug) {
	const slugs = await getPlatformNames()
	for (let i = 0; i < slugs.length; i++) {
		let otherSlug = slugs[i]
		if (slug != otherSlug) {
			let inactivePlatformIcon = document.getElementById(otherSlug + "-image")
			inactivePlatformIcon.classList.add("icon-lowlight")
			inactivePlatformIcon.classList.remove("icon-highlight")
		}
	}
}

async function resetHighlights() {
	const slugs = await getPlatformNames()
	for (let i = 0; i < slugs.length; i++) {
		let slug = slugs[i]
		let platformIcon = document.getElementById(slug + "-image")
		platformIcon.classList.remove("icon-lowlight")
		platformIcon.classList.remove("icon-highlight")
	}
}