// Load environment variables
require("dotenv").config();

// Retrieve environment variables
const project_id = process.env.PROJECT_ID;
const view_id = process.env.VIEW_ID;
const token = process.env.AUTH_TOKEN;
const page_size = process.env.PAGE_SIZE;
const filter = JSON.parse(process.env.FILTER);

const url = `https://notlabel-studio.toloka-test.ai/api/dm/views/${view_id}?interaction=filter&project=${project_id}`;
const headers = {
	accept: "*/*",
	"accept-language": "en-GB,en;q=0.5",
	"content-type": "application/json",
	priority: "u=1, i",
	"sec-ch-ua": '"Not)A;Brand";v="99", "Brave";v="127", "Chromium";v="127"',
	"sec-ch-ua-mobile": "?0",
	"sec-ch-ua-platform": '"Linux"',
	"sec-fetch-dest": "empty",
	"sec-fetch-mode": "same-origin",
	"sec-fetch-site": "same-origin",
	"sec-gpc": "1",
	Referer: `https://notlabel-studio.toloka-test.ai/projects/${project_id}/data?tab=${view_id}&page=1`,
	"Referrer-Policy": "same-origin",
	Authorization: `Token ${token}`,
};

const annotations_filter = {
	id: `${view_id}`,
	data: {
		title: "New Tab 2",
		ordering: [],
		type: "list",
		target: "tasks",
		filters: {
			conjunction: "and",
			items: filter,
		},
		hiddenColumns: {
			explore: [
				"tasks:inner_id",
				"tasks:total_predictions",
				"tasks:annotations_results",
				"tasks:annotations_ids",
				"tasks:file_upload",
				"tasks:storage_filename",
				"tasks:created_at",
				"tasks:updated_at",
				"tasks:updated_by",
				"tasks:avg_lead_time",
				"tasks:draft_exists",
			],
			labeling: [
				"tasks:data.diff",
				"tasks:data.plan",
				"tasks:data.task",
				"tasks:data.uuid",
				"tasks:data.input",
				"tasks:data.modify",
				"tasks:data.output",
				"tasks:data.sample",
				"tasks:data.context",
				"tasks:data.verdict",
				"tasks:data.batch_id",
				"tasks:data.language",
				"tasks:data.iteration",
				"tasks:data.qa_result",
				"tasks:data.input_files",
				"tasks:data.language_md",
				"tasks:data.output_files",
				"tasks:data.llm_complexity",
				"tasks:id",
				"tasks:inner_id",
				"tasks:completed_at",
				"tasks:cancelled_annotations",
				"tasks:total_predictions",
				"tasks:assignees",
				"tasks:annotators",
				"tasks:annotations_results",
				"tasks:annotations_ids",
				"tasks:file_upload",
				"tasks:storage_filename",
				"tasks:created_at",
				"tasks:updated_at",
				"tasks:updated_by",
				"tasks:avg_lead_time",
				"tasks:draft_exists",
			],
		},
		columnsWidth: {},
		columnsDisplayType: {},
		gridWidth: 4,
		semantic_search: [],
		threshold: { min: 0, max: 1 },
	},
	project: `${project_id}`,
};

const putFilter = async () => {
	try {
		const response = await fetch(url, {
			method: "PUT",
			headers: headers,
			body: JSON.stringify(annotations_filter),
			timeout: 10000,
		});
		return response.status;
	} catch (error) {
		console.error(error);
		return 500;
	}
};

const fetchFilterData = async () => {
	try {
		let result = null;

		for (let i = 0; i < 20; i++) {
			result = await putFilter();

			if (result === 200) {
				break;
			} else if (result === 500 && i === 19) {
				return null;
			}
		}

		const response = await fetch(
			`https://notlabel-studio.toloka-test.ai/api/tasks?page=1&page_size=${page_size}&view=${view_id}&project=${project_id}&include=id`,
			{
				method: "Get",
				headers: headers,
			}
		);
		return response.json();
	} catch (error) {
		console.error(error);
		return 500;
	}
};

const assignTasksToDeveloper = async (user_id, tasks) => {
	try {
		const response = await fetch(
			`https://notlabel-studio.toloka-test.ai/api/projects/${project_id}/tasks/assignees`,
			{
				method: "POST",
				headers: headers,
				body: `{"type":"annotator","selectedItems":{"all":false,"included":${tasks}},"users":[${user_id}],"filters":{"conjunction":"and","items":${JSON.stringify(filter)}}}`,
				timeout: 10000,
			}
		);
		return response.status;
	} catch (error) {
		console.error(error);
		return 500;
	}
};

module.exports = {
	fetchFilterData,
	assignTasksToDeveloper,
};
