// Default value of every user setting a plugin declares, so the simulations
// keep working when a release adds new settings.
const fs = require("fs");
const vm = require("vm");

module.exports = function paramDefaults(path) {
	const src = fs.readFileSync(path, "utf8");
	const start = src.indexOf("export function ControllableParameters()");
	if (start < 0) {
		return {};
	}
	let depth = 0;
	let end = src.indexOf("{", start);
	do {
		const c = src[end++];
		depth += c === "{" ? 1 : c === "}" ? -1 : 0;
	} while (depth > 0);
	const fn = src.slice(start, end).replace(/^export /, "");
	const list = vm.runInNewContext(fn + "\nControllableParameters();");
	const out = {};
	for (const p of list) {
		out[p.property] = p.type === "boolean" ? p.default === "true" || p.default === true : p.default;
	}
	return out;
};
