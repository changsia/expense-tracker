export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["404.html","favicon.svg"]),
	mimeTypes: {".html":"text/html",".svg":"image/svg+xml"},
	_: {
		client: {start:"_app/immutable/entry/start.DU3aY2Dv.js",app:"_app/immutable/entry/app.aoNRVuu9.js",imports:["_app/immutable/entry/start.DU3aY2Dv.js","_app/immutable/chunks/LFUb5lcJ.js","_app/immutable/chunks/BxIQwMgc.js","_app/immutable/chunks/BVWDyAXi.js","_app/immutable/entry/app.aoNRVuu9.js","_app/immutable/chunks/LFUb5lcJ.js","_app/immutable/chunks/n1BnmVg0.js","_app/immutable/chunks/BnSopFsP.js","_app/immutable/chunks/BVWDyAXi.js","_app/immutable/chunks/C3sXYn1Z.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
