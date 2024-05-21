import json
import subprocess
import os
import time
import argparse
from cleanUpPrices import prepare_card_data
from updatePrices import update_prices_json

DEFAULT_WEIGHT = 0
PRICE_FLOOR = 4
CLICK_THRESHOLD = 4
BENCHMARK_CARD = "The Union"
BENCHMARK_DROPPED = 144
FAVORITE_MAPS = 12
USE_FULL_STACK = True
USE_STANDARD_PRICE = False

if __name__ == "__main__":

    parser = argparse.ArgumentParser("priceValueLP.py")
    parser.add_argument("standard", help="If specified, uses standard prices instead of the current league", type=bool, default=False, nargs='?')
    args = parser.parse_args()

    if args.standard:
        USE_STANDARD_PRICE = True

    update_prices_json()
    prepare_card_data(DEFAULT_WEIGHT, PRICE_FLOOR)


    start_time = time.time()
    with open("./data/maps.json", 'r') as f:
        maps = json.load(f)

    with open("./data/cards.json", 'r') as f:
        data = json.load(f)

    with open("./data/real_weights.json",'r') as f:
        weights = json.load(f)

    t_name_array = []
    t_price_array = []
    t_weight_array = []
    t_stack_array = []
    t_map_label =[[0 for _ in range(len(data))] for _ in range(len(maps))]

    for i in range(len(data)):
        priceName = 'standardPrice' if USE_STANDARD_PRICE else 'price'
        t_name_array.append(data[i]['name'])
        t_price_array.append(data[i][priceName])
        t_stack_array.append(data[i]['stack'])

        try:
            areas = data[i]['drop']['areas']
            for map_id in range(len(maps)):
                if "MapWorlds"+maps[map_id] in areas:
                    t_map_label[map_id][i] = 1
        except KeyError:
            pass

    for i in range(len(data)):
        t_weight_array.append(weights[0][t_name_array[i]])

    #variables are cards and maps
    # optimization is ev of cards dot cards
    # constraints are:
    # maps total <= 12
    # for each card:
    # card <= sum of maps
    # rephrased:
    # card - sum of maps <= 0

    out = open("./temp/DivCard.lp", 'w')

    # objective function, maximize value of included cards
    out.write("Maximize\n")
    objective_string=" obj: "
    for card_id in range(len(t_name_array)):
        ev = 0
        if USE_FULL_STACK:
            if t_price_array[card_id] >= CLICK_THRESHOLD:
                ev += t_price_array[card_id] * t_weight_array[card_id] * 0.8
            if t_stack_array[card_id] * t_price_array[card_id] >= CLICK_THRESHOLD:
                ev += t_stack_array[card_id] * t_price_array[card_id] * t_weight_array[card_id] * 0.2
        else:
            if t_price_array[card_id] >= CLICK_THRESHOLD:
                ev += t_price_array[card_id] * t_weight_array[card_id]
        objective_string += str(ev) + " c"+str(card_id)+" + "
    out.write(objective_string+'0\n')
    out.write("Subject To\n")

    # constraint, only 12 maps allowed
    map_count_string = "map_count: "
    for map_index in range(len(maps)):
        map_count_string += "m"+str(map_index)+" + "
    out.write(map_count_string[:-3]+" <= " + str(FAVORITE_MAPS) + "\n")

    # constraint, for each card, it's inclusion has to be less than or equal to the sum of the maps it's in
    for card_id in range(len(t_name_array)):
        card_inclusion_string = "inc"+str(card_id)+": - c"+str(card_id)
        for map_index in range(len(maps)):
            if t_map_label[map_index][card_id] == 1:
                card_inclusion_string += " + m"+str(map_index)
        out.write(card_inclusion_string+" >= 0\n")

    # evaluate how much "droppage" is obtained by the benchmark
    index_card_id = t_name_array.index(BENCHMARK_CARD)
    card_count_constant = BENCHMARK_DROPPED/float(t_weight_array[index_card_id])

    # constraint, total stacks of cards generated has to be carried out in 6 portals
    # 6 portals of 60 slots is 360 stacks total
    # overrode to be less than an inventory or so
    feel_the_weight_string = "six_portals: "
    for card_id in range(len(t_name_array)):
        number_of_stacks = int(card_count_constant*t_weight_array[card_id]/t_stack_array[card_id])+1
        feel_the_weight_string += str(number_of_stacks) + " c"+str(card_id) + " + "
    out.write(feel_the_weight_string[:-3] + " <= 60\n")
            
    # make all parameters binary and close
    out.write("Binary\n")
    for card_id in range(len(t_name_array)):
        out.write("c"+str(card_id)+"\n")
    for map_id in range(len(maps)):
        out.write("m"+str(map_id)+"\n")
    out.write("End\n")
    out.close()

    out = open("./temp/cardkey.txt", 'w')
    for n in range(len(t_name_array)):
        out.write(str(n)+", ")
        out.write(t_name_array[n])
        out.write(", "+str(t_price_array[n]))
        out.write(", "+str(t_weight_array[n]))
        out.write(", "+str(t_stack_array[n]))
        out.write('\n')

    out.write('\n')
    for map_id in range(len(maps)):
        ev =0
        stack_ev =0 
        for card_id in range(len(t_name_array)):
            if t_map_label[map_id][card_id] == 1:
                ev += t_price_array[card_id] * t_weight_array[card_id]
                stack_ev += t_price_array[card_id] * t_weight_array[card_id] * 0.8 + t_stack_array[card_id] * t_price_array[card_id] * t_weight_array[card_id] * 0.2 
        out.write(str(map_id)+", "+maps[map_id]+", "+str(ev)+", "+str(stack_ev)+"\n")
    out.close()

    # remove old DivCard.out if it exists
    if os.path.exists("./temp/DivCard.out"):
        os.remove("./temp/DivCard.out")

    # run the integer program
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    subprocess.run(["scip","-f","./temp/DivCard.lp","-q","-l","./temp/DivCard.out"])

    # open and read the outfile into memory
    logfile=open("./temp/DivCard.out","r")
    lines = logfile.readlines()

    # parse the output
    findtext = "primal solution (original space):"
    for i in range(len(lines)):
        if findtext in lines[i]:
            break

    startline=i

    findtext = "Statistics"
    for i in range(len(lines)):
        if findtext in lines[i]:
            break

    endline = i

    used_map_ids = []
    used_card_ids = []
    finalList = []

    for i in range(startline+1,endline):
        if 'c' == lines[i][0]:
            used_card_ids.append(int(lines[i][1:4]))
        if 'm' in lines[i]:
            currentMap = maps[int(lines[i][1:4])]
            print(currentMap)
            finalList.append(currentMap)
            used_map_ids.append(int(lines[i][1:4]))
        if 'objective value' in lines[i]:
            print("value = ",lines[i][-13:-1])

    total_stacks = 0
    for card_id in used_card_ids:
        total_stacks += int(card_count_constant*t_weight_array[card_id]/t_stack_array[card_id])+1
    print("Used", str(total_stacks), "total stacks out of 360")

    print("time: ",time.time()-start_time)

    outfile = "./output/std_maps.json" if USE_STANDARD_PRICE else "./output/league_maps.json"
    with open(outfile, 'w') as f:
        json.dump(finalList, f)
