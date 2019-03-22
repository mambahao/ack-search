/**
 * Filename: /Users/justinhao/Projects/OpenSource/ack-search/src/FileItem.ts
 * Path: /Users/justinhao/Projects/OpenSource/ack-search
 * Created Date: Thursday, February 14th 2019, 1:57:51 pm
 * Author: justin.hao
 *
 * Copyright (c) 2019 Your Company
 */

import { QuickPickItem } from 'vscode';

export class FileItem implements QuickPickItem {
	label: string;
	description: string;

	constructor(public path: string, public num: number, public code: string) {
		this.label = code;
		this.description = `${path}:${num}`;
  }
}
