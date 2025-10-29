export const Abilities: import('../../../sim/dex-abilities').ModdedAbilityDataTable = {
	ange: {
		gen: 9,
		desc: "Gain 1/12 of max HP at the end of every turn. Opposing Megas lose 1/10 max HP every turn.",
		shortDesc: "Gain 1/12 of max HP at the end of every turn. Opposing Megas lose 1/10 max HP every turn.",
		onResidualOrder: 5,
		onResidualSubOrder: 4,
		onResidual(pokemon) {
			if (!pokemon.hp) return;
			const megaFoes = [];
			for (const target of pokemon.foes()) {
				if (target.baseSpecies.isMega) megaFoes.push(target);
			}
			if (megaFoes.length) {
				for (const target of megaFoes) {
					this.damage(target.baseMaxhp / 10, target, pokemon);
					this.heal(target.baseMaxhp / 10);
				}
			} else {
				this.heal(pokemon.baseMaxhp / 12);
			}
		},
		name: "Ange",
	},
	brassbond: {
		onPrepareHit(source, target, move) {
			if (move.category === 'Status' || move.multihit || move.flags['noparentalbond'] || move.flags['charge'] ||
				move.flags['futuremove'] || move.spreadHit || move.isZ || move.isMax) return;
			move.multihit = 3;
			move.multihitType = 'brassbond' as 'parentalbond';
		},
		onTryBoost(boost, target, source, effect) {
			if (effect.effectType === 'Move' && effect.multihitType && effect.hit > 1 &&
				source && target === source) {
				let i: keyof BoostsTable;
				for (i in boost) {
					delete boost[i];
				}
			}
		},
		// Damage modifier implemented in BattleActions#modifyDamage()
		onSourceModifySecondaries(secondaries, target, source, move) {
			if (move.multihitType && move.hit > 1) {
				return [];
			}
		},
		flags: {},
		name: "Brass Bond",
		gen: 9,
		desc: "This Pokemon's damaging moves hit 3x. Successive hits do 15% damage without added effects.",
		shortDesc: "This Pokemon's damaging moves hit 3x. Successive hits do 15% damage without added effects.",
	},
	contrarian: {
		onChangeBoost(boost, target, source, effect) {
			if (effect && effect.id === 'zpower') return;
			let i: BoostID;
			for (i in boost) {
				boost[i]! *= -2;
			}
		},
		name: "Contrarian",
		desc: "This Pokemon has its stat changes inverted and doubled.",
		shortDesc: "This Pokemon has its stat changes inverted and doubled.",
		gen: 9,
	},
	corrosion: {
		inherit: true,
		onModifyMovePriority: -5,
		onModifyMove(move) {
			if (!move.ignoreImmunity) move.ignoreImmunity = {};
			if (move.ignoreImmunity !== true) {
				move.ignoreImmunity['Poison'] = true;
			}
		},
		shortDesc: "This Pokemon can poison a Pokemon regardless of its typing and hit them with Poison moves.",
	},
	ionbattery: {
		onModifySpAPriority: 5,
		onModifySpA(spa, pokemon) {
			return this.chainModify(1.5);
		},
		flags: { breakable: 1 },
		name: "Ion Battery",
		desc: "This Pokemon floats and has 1.5x Sp. Atk.",
		shortDesc: "This Pokemon floats and has 1.5x Sp. Atk.",
	},
	luchadorspride: {
		onSourceAfterFaint(length, target, source, effect) {
			if (effect && effect.effectType === 'Move') {
				this.boost({ spe: length }, source);
			}
		},
		flags: {},
		name: "Luchador's Pride",
		desc: "This Pokemon's Speed is raised by 1 stage if it attacks and knocks out another Pokemon.",
		shortDesc: "This Pokemon's Speed is raised by 1 stage if it attacks and KOes another Pokemon.",
		gen: 9,
	},
	protectivethorns: {
		gen: 9,
		name: "Protective Thorns",
		desc: "Bulletproof + Iron Barbs.",
		shortDesc: "Bulletproof + Iron Barbs.",
		onTryHit(pokemon, target, move) {
			if (move.flags['bullet']) {
				this.add('-immune', pokemon, '[from] ability: Protective Thorns');
				return null;
			}
		},
		onDamagingHitOrder: 1,
		onDamagingHit(damage, target, source, move) {
			if (this.checkMoveMakesContact(move, source, target, true)) {
				this.damage(source.baseMaxhp / 8, source, target);
			}
		},
		flags: { breakable: 1 },
	},
	minus: {
		inherit: true,
		onModifySpAPriority: 5,
		onModifySpA(spa, pokemon) {
			for (const allyActive of pokemon.allies()) {
				if (allyActive.hasAbility(['minus', 'plus', 'ionbattery'])) {
					return this.chainModify(1.5);
				}
			}
		},
	},
	neutralizinggas: {
		inherit: true,
		// Ability suppression implemented in sim/pokemon.ts:Pokemon#ignoringAbility
		onSwitchIn(pokemon) {
			this.add('-ability', pokemon, 'Neutralizing Gas');
			pokemon.abilityState.ending = false;
			// Remove setter's innates before the ability starts
			for (const target of this.getAllActive()) {
				if (target.illusion) {
					this.singleEvent('End', this.dex.abilities.get('Illusion'), target.abilityState, target, pokemon, 'neutralizinggas');
				}
				if (target.volatiles['slowstart']) {
					delete target.volatiles['slowstart'];
					this.add('-end', target, 'Slow Start', '[silent]');
				}
				if (target.m.abils?.length) {
					for (const key of target.m.abils) {
						if (this.dex.abilities.get(key.slice(8)).flags['cantsuppress']) continue;
						target.removeVolatile(key);
					}
				}
			}
		},
		onEnd(source) {
			this.add('-end', source, 'ability: Neutralizing Gas');

			// FIXME this happens before the pokemon switches out, should be the opposite order.
			// Not an easy fix since we cant use a supported event. Would need some kind of special event that
			// gathers events to run after the switch and then runs them when the ability is no longer accessible.
			// (If you're tackling this, do note extreme weathers have the same issue)

			// Mark this pokemon's ability as ending so Pokemon#ignoringAbility skips it
			if (source.abilityState.ending) return;
			source.abilityState.ending = true;
			const sortedActive = this.getAllActive();
			this.speedSort(sortedActive);
			for (const pokemon of sortedActive) {
				if (pokemon !== source) {
					// Will be suppressed by Pokemon#ignoringAbility if needed
					this.singleEvent('Start', pokemon.getAbility(), pokemon.abilityState, pokemon);
				}
				if (pokemon.m.abils?.length) {
					for (const innate of pokemon.m.abils) {
						// permanent abilities
						if (pokemon.volatiles[innate]) continue;
						pokemon.addVolatile(innate, pokemon);
					}
				}
			}
		},
	},
	plus: {
		inherit: true,
		onModifySpAPriority: 5,
		onModifySpA(spa, pokemon) {
			for (const allyActive of pokemon.allies()) {
				if (allyActive.hasAbility(['minus', 'plus', 'ionbattery'])) {
					return this.chainModify(1.5);
				}
			}
		},
	},
	trace: {
		inherit: true,
		onUpdate(pokemon) {
			if (!this.effectState.seek) return;
			const isAbility = pokemon.ability === 'trace';

			const possibleTargets = pokemon.adjacentFoes().filter(
				target => !target.getAbility().flags['notrace'] && target.ability !== 'noability'
			);
			if (!possibleTargets.length) return;

			const target = this.sample(possibleTargets);
			const ability = target.getAbility();

			if (isAbility) {
				if (pokemon.setAbility(ability)) {
					this.add('-ability', pokemon, ability, '[from] ability: Trace', `[of] ${target}`);
				}
			} else {
				pokemon.removeVolatile('ability:trace');
				pokemon.addVolatile('ability:' + ability.id, pokemon);
				this.add('-ability', pokemon, ability, '[from] ability: Trace', `[of] ${target}`);
			}
		},
	},
};
