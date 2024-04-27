import json
from pathlib import Path

cardData = './data/cards.json'
leagueCardPriceOverrides = './data/league_overrides.json'
stdCardPriceOverrides = './data/std_overrides.json'

def prepare_card_data(DEFAULT_WEIGHT, PRICE_FLOOR):
    global cardData, stdCardPriceOverrides, leagueCardPriceOverrides
    
    with open(cardData, 'r') as file:
        allCards = json.load(file)
    with open(leagueCardPriceOverrides, 'r') as file:
        leagueCardPriceOverrides = json.load(file)
    with open(stdCardPriceOverrides, 'r') as file:
        stdCardPriceOverrides = json.load(file)

    clean_card_data = []

    for card in allCards:
        leagueOverride = next((o for o in leagueCardPriceOverrides if o['cardName'] == card['name']), None)
        stdOverride = next((o for o in stdCardPriceOverrides if o['cardName'] == card['name']), None)

        if card.get('reward') == 'Disabled':
            continue

        if leagueOverride:
            card['price'] = leagueOverride['cardValue']
        elif card['price'] < PRICE_FLOOR:
            card['price'] = 0

        if stdOverride:
            card['standardPrice'] = stdOverride['cardValue']
        elif card['standardPrice'] < PRICE_FLOOR:
            card['standardPrice'] = 0

        if 'drop' not in card:
            continue
        elif 'max_level' not in card['drop']:
            card['drop']['max_level'] = 100

        card.setdefault('weight', DEFAULT_WEIGHT)

        clean_card_data.append(card)

    with open("./temp/prices.json", "w") as file:
        json.dump(clean_card_data, file)
