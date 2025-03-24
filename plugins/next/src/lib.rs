#![allow(clippy::not_unsafe_ptr_arg_deref)]
use swc_core::{
    ecma::ast::Program,
    plugin::{plugin_transform, proxies::TransformPluginProgramMetadata},
};
use swc_ecma_visit::VisitMutWith;

#[plugin_transform]
fn swc_plugin(mut program: Program, data: TransformPluginProgramMetadata) -> Program {
    let config: analogia::Config = serde_json::from_str::<Option<analogia::Config>>(
        &data
            .get_transform_plugin_config()
            .expect("failed to get plugin config for analogia-react"),
    )
    .expect("invalid packages")
    .unwrap_or_else(|| analogia::Config::All(true));

    let source_map = std::sync::Arc::new(data.source_map);
    program.visit_mut_with(&mut analogia::preprocess(config, source_map));
    program
}
