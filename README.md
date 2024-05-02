# Who woulDIV thought?

## What is it

This is a tool made to streamline the process of choosing and comparing which maps to favourite while using the [Divination Scarab of Curation](https://www.poewiki.net/wiki/Divination_Scarab_of_Curation), both with and without the use of [Divination Scarab of Completion](https://www.poewiki.net/wiki/Divination_Scarab_of_Completion), for both League and Standard.

## How it works

Every day, once a day, the backend api fetches the prices of all divination cards for both Standard and League from [Poe Ninja](https://poe.ninja) and generates an updated list, taking into account the different weightings datamined/tested by the community, overriding prices for cards that don't make sense (i.e. [Rain of Chaos](https://poe.ninja/economy/standard/divination-cards/rain-of-chaos) costing 8c per stack but rewarding only 1c per stack).

This list is the used to compute the best possible selection of favourite maps. The list is generated taking into account a blacklist of cards (cards which we don't want for various reasons), a minimum price and a "force list" for card we always want to see, regardless of their price.

These 12 maps are then combined with an example card of choice and the average quantity dropped in your maps (by default either [The Gambler](https://poe.ninja/economy/standard/divination-cards/the-gambler), [The Union](https://poe.ninja/economy/standard/divination-cards/the-union) or [The Wrath](https://poe.ninja/economy/standard/divination-cards/the-wrath) because of their well-known droprate and weight) to calculate the estimated droprates and Effective Values (EVs) of all the other droppable cards.

All the shown data is divided in "with Stack Scarab (SS)" and "without SS (Stack Scarab being the aforementioned Divination Scarab of Completion).

## Credits

- Credits to ABodyPillow, DKrizere & deathbeam for the [original tool](https://6jtcys.csb.app/)
- Credits to [Snap](https://www.twitch.tv/snapow), [Empy](https://www.twitch.tv/empyriangaming) and their whole group for the work they put into the original tool and the data it uses
- Credits to [nerdyjoe314](https://github.com/nerdyjoe314) for the [original algorithm](https://github.com/nerdyjoe314/divinationscarabs) used to calculate the best maps to use
- Card prices and weightings taken from [Poe Ninja](https://poe.ninja/)

## Contributing

### Requirements

To run this project on your machine, you will need:

- Python 3.x
- Pip for python 3.x
- Nodejs 20.x
- Npm 10.x
- [SCIP](https://www.scipopt.org/index.php#download)

### Adjusting prices

To Adjust prices, edit the `data/std_overrides.json` and the `data/league_overrides.json` for Standard and League respectively. **DO NOT** edit `data/cards.json` directly, as those changes will most likely be overwritten with the next sync from Poe Ninja.

To adjust the cards weightings, edit the `data/real_weights.json`.

## Todo

- [x] Make pinned card and its average quantity customizable
- [x] Filter available pinnable cards based on the selected maps
- [x] Refactor json files to be inline with the naming and their location
- [ ] Fetch maps list automatically
- [ ] Differentiate the cards blacklist for Standard and League
- [ ] Make tables sortable
- [ ] Make tables filterable/searchable
- [ ] Add a description for the tool similar to this readme's intro to the website itself (so people know how it works)
