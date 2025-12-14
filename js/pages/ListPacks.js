import { fetchPacks, fetchPackLevels, fetchList } from "../content.js";
import { embed } from "../util.js";
import { score } from "../score.js";

import Spinner from "../components/Spinner.js";
import LevelAuthors from "../components/List/LevelAuthors.js";

export default {
    components: {
        Spinner,
        LevelAuthors,
    },
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="pack-list">
            <div class="packs-nav">
                <div>
                    <button @click="switchLevels(i)" v-for="(pack, i) in packs" :style="{background: pack.colour}">
                        <p>{{pack.name}}</p>
                    </button>
                </div>
            </div>
            <div class="list-container">
                <table class="list" v-if="selectedPackLevels">
                    <tr v-for="(level, i) in selectedPackLevels">
                        <td class="rank">
                            <p class="type-label-lg">#{{list.findIndex((lvl) => lvl[0].name == level[0].level.name) + 1}}</p>
                        </td>
                        <td class="level" :class="{ 'active': selectedLevel == i, 'error': !level }">
                            <button :style= "[selectedLevel == i ? {background: pack.colour} : {}]" @click="selectedLevel = i">
                                <span class="type-label-lg">{{ level[0].level.name || \`Error (\.json)\` }}</span>
                            </button>
                        </td>
                    </tr>
                </table>
            </div>
            <div class="level-container">
                <div class="level" v-if="selectedPackLevels[selectedLevel]">
                    <h1>{{ selectedPackLevels[selectedLevel][0].level.name }}</h1>
                    <LevelAuthors :author="selectedPackLevels[selectedLevel][0].level.author" :creators="selectedPackLevels[selectedLevel][0].level.creators" :verifier="selectedPackLevels[selectedLevel][0].level.verifier"></LevelAuthors>
                    <iframe class="video" :src="embed(selectedPackLevels[selectedLevel][0].level.verification)" frameborder="0"></iframe>
                    <ul class="stats">
                        <li>
                            <div class="type-title-sm">ID</div>
                            <p class="type-label-lg">{{ selectedPackLevels[selectedLevel][0].level.id }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">Skillset</div>
                            <p>{{ selectedPackLevels[selectedLevel][0].level.skillset || 'Not Specified' }}</p>
                        </li>
                    </ul>
                    <h2>Records</h2>
                    <table class="records">
                        <tr v-for="record in selectedPackLevels[selectedLevel][0].level.records" class="record">
                            <td class="percent">
                                <p v-if="record.percent == 100"><b>{{ record.percent }}%</b></p>
                                <p v-else>{{ record.percent }}%</p>
                            </td>
                            <td class="user">
                                <a :href="record.link" target="_blank" class="type-label-lg">{{ record.user }}</a>
                            </td>
                            <td class="hz">
                                <p>{{ record.hz }}fps</p>
                            </td>
                        </tr>
                    </table>
                </div>
                <div v-else class="level" style="height: 100%; justify-content: center; align-items: center;">
                    <p>(ノಠ益ಠ)ノ彡┻━┻</p>
                </div>
            </div>
            <div class="meta-container">
                <div class="meta">
                    <div class="errors" v-show="errors.length > 0">
                        <p class="error" v-for="error of errors">{{ error }}</p>
                    </div>
                    <div class="dark-bg">
                    <h1>Packs</h1>
                    <br>
                    <p>
                    You can complete levels for these list packs, which have all been selected by the staff team, and have them added to your profile. Simply completing the levels is all that is necessary to have your records uploaded. When all levels are finished, the packs will instantly show up on your profile.
                    </p>
                    </div>
                    <h3>Credits:</h3>
                    <p><a href="https://youtube.com/@krisgra" target="_blank">KrisGra</a></p>
                </div>
            </div>
        </main>
    `,
    data: () => ({
        list: [],
        packs: [],
        errors: [],
        selected: 0,
        selectedLevel: 0,
        selectedPackLevels: [],
        loading: true,
        loadingPack: true,
    }),
    computed: {
        pack() {
            return this.packs[this.selected];
        },
    },
    async mounted() {
        this.packs = await fetchPacks();
        this.list = await fetchList();
        console.log([...this.list])
        console.log(

        );
        this.selectedPackLevels = await fetchPackLevels(
            this.packs[this.selected].name
        );

        // Error handling todo: make error handling
        // if (!this.packs) {
        //     this.errors = [
        //         "Failed to load list. Retry in a few minutes or notify list staff.",
        //     ];
        // } else {
        //     this.errors.push(
        //         ...this.packs
        //             .filter(([_, err]) => err)
        //             .map(([_, err]) => {
        //                 return `Failed to load level. (${err}.json)`;
        //             })
        //     );
        // }

        // Hide loading spinner
        this.loading = false;
        this.loadingPack = false;
    },
    methods: {
        async switchLevels(i) {
            this.loadingPack = true;

            this.selected = i ;
            this.selectedLevel = 0;
            this.selectedPackLevels = await fetchPackLevels(
                this.packs[this.selected].name
            );

            this.loadingPack = false;
        },
        score,
        embed,
    },
}
