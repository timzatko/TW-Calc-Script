import { AlarmClock } from './components/notepad/alarm-clock';
import { BattleCalc } from './components/battle-calc/battle-calc';
import { Birthday } from './components/birthday/birthday';
import { CatchErrors } from './components/error-tracker/catch-errors';
import { Chests } from './components/chests/chests';
import { Config } from './components/config/config';
import { Craft } from './components/craft/craft';
import { DuelBar } from './components/duel-bar/duel-bar';
import { ErrorTracker } from './components/error-tracker/error-tracker';
import { Gui } from './components/gui/gui';
import { Importer } from './components/importer/importer';
import { inject, singleton } from 'tsyringe';
import { Language } from './components/language/language';
import { Logger } from './components/logger/logger';
import { NearestJobs } from './components/nearest-jobs/nearest-jobs';
import { Quests } from './components/quests/quests';
import { Settings } from './components/settings/settings';
import { TheWestWindow } from './@types/the-west';
import { TombolaExporter } from './components/tombola/tombola-exporter';
import { tw2patch } from './tw2-patch';
import { Updater } from './components/updater/updater';
import { WestCalc } from './components/west-calc/west-calc';

@singleton()
export class Initializer {
    constructor(
        public readonly language: Language,
        public readonly config: Config,
        public readonly importer: Importer,
        public readonly updater: Updater,
        public readonly settings: Settings,
        public readonly gui: Gui,
        public readonly westCalc: WestCalc,
        public readonly logger: Logger,
        public readonly birthday: Birthday,
        public readonly nearestJobs: NearestJobs,
        public readonly tombolaExporter: TombolaExporter,
        public readonly errorTracker: ErrorTracker,
        public readonly duelBar: DuelBar,
        public readonly battleCalc: BattleCalc,
        public readonly alarmClock: AlarmClock,
        public readonly chests: Chests,
        public readonly quests: Quests,
        public readonly craft: Craft,
        @inject('window') public readonly window: TheWestWindow,
        @inject('tw2patch') public readonly patch: typeof tw2patch,
    ) {
        this.errorTracker.execute(() => {
            this.logger.log('initializing tw-calc...');
            this.registerApi();
            this.patch(this.window);
            this.language.init(() => {
                this.gui.init();
                this.updater.init();
                this.birthday.init();
                this.nearestJobs.init();
                this.duelBar.init();
                this.tombolaExporter.init();
                this.battleCalc.init();
                this.alarmClock.init();
                this.chests.init();
                this.quests.init();
                this.craft.init();
            });
        });
    }

    @CatchErrors('Initializer.registerApi')
    registerApi(): void {
        const gameMin = '1.36';
        const gameMax = this.window.Game.version.toString();
        const { scriptShortName, scriptName, website, author, contributors, githubUrl, discordUrl } = this.config;
        const authors = `${author}, ${contributors.join(', ')}`;

        const api = this.window.TheWestApi.register(scriptShortName, scriptName, gameMin, gameMax, authors, website);
        const links = this.window
            .$(
                `<div style="font-size: 20px; font-family: Georgia, 'Times New Roman', serif; text-align: center; margin: 15px; text-shadow: 1px 1px 0 #FFCC66, 1px 1px 2px #000000;"></div>`,
            )
            .append(`<div style="margin-bottom: 8px"><a href="${website}" target="_blank">${website}</a></div>`)
            .append(`<div style="margin-bottom: 8px"><a href="${discordUrl}" target="_blank">Discord</a></div>`)
            .append(`<div style="margin-bottom: 32px"><a href="${githubUrl}" target="_blank">GitHub</a></div>`)
            .append(
                `<div><a href="javascript: TW_Calc._window.open({ tab: 'settings' }); void(0)">${this.language.getTranslation(
                    3,
                )}</a></div>`,
            );

        const content = this.window.$(`<div></div>`).append(links);

        if (this.config.donations) {
            content.append(`<div style="font-size: 16px; text-align: center; margin-bottom: 15px">If you like our webpage and script, please donate for server costsand further development, we will be very grateful to you. We are funding everything from our own resources. All your donations will be appreciated and used in best way possible to ensure future development of this script.<div style="font-weight: bold; font-size: 20px; font-family: Georgia, 'Times New Roman'; margin: 4px;">Thank you!</div></div>
                <div style="text-align: center"><form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top"><input type="hidden" name="cmd" value="_s-xclick"><input type="hidden" name="hosted_button_id" value="LRG4X3PGMYHZY"><input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif" border="0" name="submit" alt="PayPal - The safer, easier way to pay online!"><img alt="" border="0" src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif" width="1" height="1"></form></div>`);
        }

        api.setGui(content);
    }
}
