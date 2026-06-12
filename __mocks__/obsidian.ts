export const requestUrl = jest.fn();

export abstract class DataAdapter {
	abstract exists(normalizedPath: string): Promise<boolean>;
	abstract mkdir(normalizedPath: string): Promise<void>;
	abstract read(normalizedPath: string): Promise<string>;
	abstract write(normalizedPath: string, data: string): Promise<void>;
	abstract remove(normalizedPath: string): Promise<void>;
	abstract list(normalizedPath: string): Promise<{ files: string[]; folders: string[] }>;
}

export class App {}

export class Plugin {
	app = new App();
	manifest = { id: 'test-plugin', name: 'Test', version: '1.0.0', minAppVersion: '0.0.0', description: '' };
	addCommand = jest.fn();
	addRibbonIcon = jest.fn().mockReturnThis();
	addSettingTab = jest.fn();
	registerMarkdownCodeBlockProcessor = jest.fn();
	loadData = jest.fn().mockResolvedValue({});
	saveData = jest.fn().mockResolvedValue(undefined);
}

export class PluginSettingTab {
	constructor(public app: App, public plugin: Plugin) {}
	display = jest.fn();
}

export class Setting {
	constructor(_containerEl: HTMLElement) {}
	setName = jest.fn().mockReturnThis();
	setDesc = jest.fn().mockReturnThis();
	addText = jest.fn().mockReturnThis();
	addSlider = jest.fn().mockReturnThis();
	addToggle = jest.fn().mockReturnThis();
}

export class MarkdownView {
	app = new App();
	file: null = null;
	leaf = { openFile: jest.fn() };
}

export class Notice {
	constructor(_message: string) {}
}
