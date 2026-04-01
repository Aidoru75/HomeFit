const { withAndroidManifest, withInfoPlist } = require('@expo/config-plugins');

function withHomeFitFileAssociation(config) {
  // ── Android: add intent-filter for application/x-homefit files ──────────
  config = withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest;
    const activities = manifest.application[0].activity;
    const main = activities.find(
      (a) => a.$['android:name'] === '.MainActivity'
    );
    if (!main) return cfg;

    // Avoid duplicate on repeated prebuild
    const already = (main['intent-filter'] || []).some((f) => {
      const data = f.data?.[0]?.$;
      return data?.['android:mimeType'] === 'application/x-homefit';
    });
    if (already) return cfg;

    main['intent-filter'] = main['intent-filter'] || [];
    // Match by our custom MIME type
    main['intent-filter'].push({
      action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
      category: [{ $: { 'android:name': 'android.intent.category.DEFAULT' } }],
      data: [{ $: { 'android:scheme': 'content', 'android:mimeType': 'application/x-homefit' } }],
    });
    // Match by file extension when WhatsApp sends application/octet-stream
    main['intent-filter'].push({
      action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
      category: [{ $: { 'android:name': 'android.intent.category.DEFAULT' } }],
      data: [{ $: { 'android:scheme': 'content', 'android:mimeType': 'application/octet-stream', 'android:pathPattern': '.*\\.homefit' } }],
    });
    // Match file:// URIs
    main['intent-filter'].push({
      action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
      category: [{ $: { 'android:name': 'android.intent.category.DEFAULT' } }],
      data: [{ $: { 'android:scheme': 'file', 'android:mimeType': '*/*', 'android:pathPattern': '.*\\.homefit' } }],
    });

    return cfg;
  });

  // ── iOS: register UTI and document type ─────────────────────────────────
  config = withInfoPlist(config, (cfg) => {
    const plist = cfg.modResults;

    // UTImportedTypeDeclarations
    if (!plist.UTImportedTypeDeclarations) plist.UTImportedTypeDeclarations = [];
    const alreadyUTI = plist.UTImportedTypeDeclarations.some(
      (d) => d.UTTypeIdentifier === 'com.aidoru.homefit.backup'
    );
    if (!alreadyUTI) {
      plist.UTImportedTypeDeclarations.push({
        UTTypeIdentifier: 'com.aidoru.homefit.backup',
        UTTypeDescription: 'HomeFit Backup',
        UTTypeConformsTo: ['public.data'],
        UTTypeTagSpecification: {
          'public.filename-extension': ['homefit'],
          'public.mime-type': 'application/x-homefit',
        },
      });
    }

    // CFBundleDocumentTypes
    if (!plist.CFBundleDocumentTypes) plist.CFBundleDocumentTypes = [];
    const alreadyDoc = plist.CFBundleDocumentTypes.some(
      (d) => d.CFBundleTypeName === 'HomeFit Backup'
    );
    if (!alreadyDoc) {
      plist.CFBundleDocumentTypes.push({
        CFBundleTypeName: 'HomeFit Backup',
        LSHandlerRank: 'Owner',
        LSItemContentTypes: ['com.aidoru.homefit.backup'],
      });
    }

    return cfg;
  });

  return config;
}

module.exports = withHomeFitFileAssociation;
