// WebMCP declarative attributes (https://developer.chrome.com/docs/ai/webmcp/declarative-api)
declare namespace astroHTML.JSX {
	interface FormHTMLAttributes {
		toolname?: string;
		tooldescription?: string;
		toolautosubmit?: boolean | string;
	}
	interface InputHTMLAttributes {
		toolparamdescription?: string;
		toolparamtitle?: string;
	}
	interface SelectHTMLAttributes {
		toolparamdescription?: string;
	}
	interface TextareaHTMLAttributes {
		toolparamdescription?: string;
	}
}
