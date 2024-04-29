import json
import requests

api = 'https://poe.ninja/api/data/itemoverview?league=%%LEAGUE_NAME%%&type=DivinationCard'

def update_prices_json():

    with open('./LEAGUENAME') as f:
        LEAGUE_NAME = f.read().strip()

    stdPoeNinja = requests.get(api.replace('%%LEAGUE_NAME%%', 'Standard')).json()
    leaguePoeNinja = requests.get(api.replace('%%LEAGUE_NAME%%', LEAGUE_NAME)).json()

    with open('./data/cards.json') as f:
        cards = json.load(f)
    
    with open('./realWeights.json') as f:
        weights = json.load(f)
    
    updatedList = []
    for card in cards:
        stdCard = next((line for line in stdPoeNinja['lines'] if line['name'] == card['name']), None)
        leagueCard = next((line for line in leaguePoeNinja['lines'] if line['name'] == card['name']), None)
        updatedCard = card.copy()
        updatedCard['standardPrice'] = stdCard['chaosValue'] if stdCard else 0.0
        updatedCard['price'] = leagueCard['chaosValue'] if leagueCard else 0.0
        updatedCard['weight'] = weights[0][card['name']] if card['name'] in weights[0] else 0.0

        isDisabled = False
        for explicit in stdCard['explicitModifiers'] if stdCard else []:
            if explicit['text'].startswith('Disabled'):
                isDisabled = True
                break
        
        for explicit in leagueCard['explicitModifiers'] if leagueCard else []:
            if explicit['text'].startswith('Disabled'):
                isDisabled = True
                break
        
        updatedCard['disabled'] = isDisabled
        updatedList.append(updatedCard)

    with open('./data/cards.json', 'w') as f:
        json.dump(updatedList, f, indent=4)
