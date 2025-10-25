export const Items: import('../../../sim/dex-items').ModdedItemDataTable = {
	slowbronite: {
		inherit: true,
		onTakeItem(item, source) {
			if (item.megaEvolves === source.baseSpecies.name || item.megaStone === source.baseSpecies.name) return false;
			return true;
		},
	},
	greninjite: {
		inherit: true,
		onTakeItem(item, source) {
			if (item.megaEvolves === source.baseSpecies.name || item.megaStone === source.baseSpecies.name) return false;
			return true;
		},
	},
	chesnaughtite: {
		inherit: true,
		isNonstandard: "Unobtainable",
	},
	delphoxite: {
		inherit: true,
		isNonstandard: "Unobtainable",
	},
	mewtwonitex: {
		inherit: true,
		isNonstandard: "Unobtainable",
	},
	mewtwonitey: {
		inherit: true,
		isNonstandard: "Unobtainable",
	},
	diancite: {
		inherit: true,
		isNonstandard: "Unobtainable",
	},
	zygardite: {
		inherit: true,
		onTakeItem(item, source) {
			if ((source.baseSpecies.baseSpecies === 'Zygarde' && source.baseAbility === 'powerconstruct') ||
				source.baseSpecies.name === 'Zygarde-Mega') return false;
			return true;
		},
	},
	butterfreenite: {
		name: "Butterfreenite",
		spritenum: 9999,
		megaStone: "Butterfree-Gmax",
		megaEvolves: "Butterfree",
		itemUser: ["Butterfree"],
		onTakeItem(item, source) {
			if (item.megaEvolves === source.baseSpecies.baseSpecies) return false;
			return true;
		},
		num: 2587,
		gen: 9,
	},
	venusauritey: {
		name: "Venusaurite Y",
		spritenum: 9999,
		megaStone: "Venusaur-Gmax",
		megaEvolves: "Venusaur",
		itemUser: ["Venusaur"],
		onTakeItem(item, source) {
			if (item.megaEvolves === source.baseSpecies.baseSpecies) return false;
			return true;
		},
		num: 2588,
		gen: 9,
	},
};
