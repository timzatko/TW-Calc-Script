import { CraftService } from './craft-service';
import { CraftView } from './craft-view';
import { CraftWindowTab, CraftWindowTabInitOptions } from './craft-window.types';
import { ErrorTracker } from '../error-tracker/error-tracker';
import { inject, singleton } from 'tsyringe';
import { Language } from '../language/language';
import { Logger } from '../logger/logger';
import { TheWestWindow } from '../../@types/the-west';
import { TW2WindowTranslation, TW2WindowView } from '../tw2-window/tw2-window.types';

@singleton()
export class CraftViewFactory {
    constructor(
        @inject('window') private readonly window: TheWestWindow,
        private readonly logger: Logger,
        private readonly craftService: CraftService,
        private readonly language: Language,
        private readonly errorTracker: ErrorTracker,
    ) {}

    getWindowView(
        key: CraftWindowTab,
        title: TW2WindowTranslation,
    ): TW2WindowView<CraftWindowTab, CraftWindowTabInitOptions> {
        let craftView: CraftView;
        return {
            key,
            title,
            loader: true,
            init: initOptions => {
                if (!craftView || typeof initOptions === 'undefined') {
                    return;
                }
                setTimeout(() => {
                    this.errorTracker.execute(() => {
                        craftView.show(initOptions.showRecipe.id);
                    });
                }, 250);
            },
            destroy: () => {
                if (!craftView) {
                    return;
                }
                craftView.destroy();
            },
            getMainDiv: (): JQuery => {
                craftView = CraftView.of(
                    key,
                    this.craftService,
                    this.window,
                    this.logger,
                    this.language,
                    this.errorTracker,
                );
                this.window['a' + key] = craftView;
                return craftView.getMainDiv();
            },
        };
    }
}
