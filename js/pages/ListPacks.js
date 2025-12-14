import { fetchPacks, fetchList, fetchPackLevels } from "../content.js"; // Removed fetchPackLevels
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
        <main v-if="loading" class="pack-list-loading">
            <Spinner />
        </main>

        <main v-else class="pack-list">
            <!-- Packs Navigation -->
            <div class="packs-nav" v-if="packs.length">
                <div>
                    <button
                        v-for="(pack, i) in packs"
                        :key="pack.name"
                        @click="switchLevels(i)"
                        :style="{ background: pack.colour }"
                    >
                        <p>{{ pack.name }}</p>
                    </button>
                </div>
            </div>

            <!-- Levels List -->
            <div class="list-container">
                <Spinner v-if="loadingPack" />

                <table
                    v-else-if="selectedPackLevels.length"
                    class="list"
                >
                    <tr v-for="(level, i) in selectedPackLevels" :key="i">
                        <td class="rank">
                            <p class="type-label-lg">
                                #{{ getRank(level) }}
                            </p>
                        </td>
                        <td
                            class="level"
                            :class="{ active: selectedLevel === i, error: !level }"
                        >
                            <button
                                @click="selectedLevel = i"
                                :style="selectedLevel === i ? { background: pack?.colour } : {}"
                            >
                                <span class="type-label-lg">
                                    {{ level?.level?.name || 'Invalid Level' }}
                                </span>
                            </button>
                        </td>
                    </tr>
                </table>
            </div>

            <!-- Level Details -->
            <div class="level-container">
                <div
                    v-if="activeLevel"
                    class="level"
                >
                    <h1>{{ activeLevel.name }}</h1>

                    <LevelAuthors
                        :author="activeLevel.author"
                        :creators="activeLevel.creators"
                        :verifier="activeLevel.verifier"
                    />

                    <iframe
                        v-if="activeLevel.verification"
                        class="video"
                        :src="embed(activeLevel.verification)"
                        frameborder="0"
                    ></iframe>

                    <ul class="stats">
                        <li>
                            <div class="type-title-sm">ID</div>
                            <p class="type-label-lg">{{ activeLevel.id }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">Skillset</div>
                            <p>{{ activeLevel.skillset || 'Not Specified' }}</p>
                        </li>
                    </ul>

                    <h2>Records</h2>
                    <table class="records" v-if="activeLevel.records?.length">
                        <tr
                            v-for="(record, i) in activeLevel.records"
                            :key="i"
                            class="record"
                        >
                            <td class="percent">
                                <p :style="record.percent === 100 ? 'font-weight:bold' : ''">
                                    {{ record.percent }}%
                                </p>
                            </td>
                            <td class="user">
                                <a
                                    :href="record.link"
                                    target="_blank"
                                    class="type-label-lg"
                                >
                                    {{ record.user }}
                                </a>
                            </td>
                            <td class="hz">
                                <p>{{ record.hz }}fps</p>
                            </td>
                        </tr>
                    </table>
                </div>

                <div v-else class="level empty">
                    <p>Select a level</p>
                </div>
            </div>
        </main>
    `,

    data() {
        return {
            list: [],
            packs: [],
            selectedPackLevels: [],
            selected: 0,
            selectedLevel: 0,
            loading: true,
            loadingPack: false,
        };
    },

    computed: {
        pack() {
            return this.packs[this.selected] || null;
        },

        activeLevel() {
            return this.selectedPackLevels?.[this.selectedLevel] || null; // Levels are now directly inside packs
        },
    },

    async mounted() {
        try {
            this.packs = (await fetchPacks()) || [];
            this.list = (await fetchList()) || [];

            if (this.packs.length) {
                this.loadingPack = true;
                this.selectedPackLevels = this.packs[0].levels || []; // Use levels from pack directly
                this.loadingPack = false;
            }
        } catch (err) {
            console.error("Failed to load list packs:", err);
        } finally {
            this.loading = false;
        }
    },

    methods: {
        async switchLevels(i) {
            if (!this.packs[i]) return;

            this.loadingPack = true;
            this.selected = i;
            this.selectedLevel = 0;
            this.selectedPackLevels = [];

            try {
                this.selectedPackLevels = this.packs[i].levels || []; // Use levels directly
            } catch (err) {
                console.error("Failed to load pack:", err);
            } finally {
                this.loadingPack = false;
            }
        },

        getRank(level) {
            if (!level?.level?.name) return '?';
            const idx = this.list.findIndex(
                (lvl) => lvl?.[0]?.name === level.level.name
            );
            return idx === -1 ? '?' : idx + 1;
        },

        score,
        embed,
    },
};


