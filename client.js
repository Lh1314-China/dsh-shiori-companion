window.__ModuleLoader__.load({
  id: 'dsh-shiori-companion',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const useState = React.useState;
    const useEffect = React.useEffect;
    const useCallback = React.useCallback;
    const useSyncExternalStore = React.useSyncExternalStore;

    const NS = 'shiori-companion';
    const API = '/api/shiori-companion';

    const DICT = {
      zh: {
        navLabel: '记忆面板',
        title: '记忆面板',
        subtitle: '分层记忆 · L0–L3 · 只读 shiori 数据',
        refresh: '刷新',
        loading: '读取中…',
        retry: '重试',
        close: '收起',
        error: '出错了',
        empty: '（空）',
        scope: '视野',
        generated: '读取于',
        tabOverview: '总览',
        tabSparks: '火花卡',
        tabWork: '工作卡',
        tabTopics: '专题',
        tabFeatures: '开关',
        tabArchive: '归档',
        tabDepth: '深度',
        depthTitle: '深度状态',
        depthHint: '本地伴生模块：海马体、语义区、经验验证、情感、梦/日记；不写 shiori 的 L0–L3。',
        depthFocus: '焦点',
        depthHealth: '体检',
        depthQueue: '队列',
        depthHippo: '海马体',
        depthContext: '语义思考区',
        depthVerify: '待验证',
        depthAffect: '情感',
        depthCustom: '自定义区',
        depthDream: '最近的梦',
        depthEmpty: '（空）',
        depthError: '读不到深度状态',
        customCreate: '新建自定义区',
        customId: 'id（小写/短横线）',
        customName: '名称',
        customTtl: '保留天数',
        customMax: '条数上限',
        customCreateBtn: '创建',
        customFeed: '写一条',
        customSave: '保存',
        customClear: '清空输入',
        customNeedFeature: '先去「开关」打开 features.custom_areas，才能新建/写入。',
        customCreated: '自定义区已创建。',
        customSaved: '已写入自定义区。',
        customEmpty: '还没有自定义区。',
        customEntries: '最近条目',
        tabSetup: '设置',
        setupTitle: '配置向导',
        setupHint: '检查 dataRoot / stateRoot / shioriCompanion，并生成可粘贴的 cordis.patch.yml 片段。',
        setupCopy: '复制片段',
        setupCopied: '已复制',
        setupOk: '通过',
        setupFail: '未通过',
        setupOptional: '可选',
        setupWarn: '警告',
        tabTimeline: '时间线',
        kpiActiveSparks: '生效火花',
        kpiTopics: '专题',
        kpiActiveWork: '进行中工作卡',
        kpiFeatures: '开关已开',
        l0Name: 'L0 人设卡',
        l0Desc: '每轮常驻，决定底色',
        l1Name: 'L1 核心记忆',
        l1Desc: '每轮注入，超预算就先下沉',
        l2Name: 'L2 火花卡',
        l2Desc: '按触发词浮回，不占常驻',
        l3Name: 'L3 专题',
        l3Desc: '按需展开，只露一行索引',
        chars: '字',
        target: '软目标',
        hard: '硬顶',
        budget: '上限',
        fallback: 'global 回退',
        present: '已读到',
        missing: '没读到',
        activeCount: '{count} 生效',
        retiredCount: '{count} 退役',
        topicCount: '{count} 个',
        archiveCount: '{count} 张',
        workCount: '{count} 张',
        recentSparks: '最近的火花',
        activeWork: '进行中的工作卡',
        diagnostics: '诊断',
        noDiagnostics: '没有发现数据问题。',
        sparkSearch: '搜标题、摘要、触发词或实体',
        filterAll: '全部',
        filterActive: '生效',
        filterRetired: '退役',
        noSparks: '没有匹配的火花卡。',
        selectSpark: '点左边一张卡看全文。',
        triggers: '触发词',
        entities: '实体',
        links: '连线',
        updated: '更新',
        file: '文件',
        summary: '摘要',
        content: '正文',
        newWorkTitle: '新工作卡标题',
        newWorkGoal: '完成的标准（可选）',
        startWork: '开工',
        workActive: '进行中',
        workArchived: '已归档',
        statusActive: '进行中',
        statusStagnated: '停滞',
        statusDone: '待归档',
        statusArchived: '已归档',
        noWork: '还没有工作卡。',
        notePlaceholder: '记一笔进度…',
        addStep: '记一笔',
        addDecision: '记决策',
        addArtifact: '记产物',
        outcomePlaceholder: '收工结果…',
        finishWork: '收工（进冷却）',
        archiveWork: '归档',
        archiveCooling: '冷却中，{time} 后可归档',
        finishHint: '收工后进 7 天冷却，冷却结束才能归档。',
        steps: '步骤',
        decisions: '决策',
        artifacts: '产物',
        wakeWords: '唤醒词',
        noTopics: '还没有专题。',
        topicHint: '点左边一个专题看全文。',
        topicReadOnly: '专题正文只读展示；写入仍走 shiori 的 memory_rewrite。',
        featureHint: '这 18 个开关只记录意图，具体执行仍在 memory-tools 脚本里；不会改 shiori 的记忆。',
        featureRecall: '记忆检索',
        featureHealth: '记忆体检',
        featureJudge: '判定与反馈',
        featureCollect: '每日收工',
        featureArchive: '归档库',
        featureSnapshot: '快照导出',
        featureGraph: '火花图谱',
        featureWebLearn: '联网摘要',
        featurePromptSection: '提示词注入',
        featureVector: '向量检索',
        featureCustomAreas: '自定义记忆区',
        featureDream: '梦记',
        featureDiary: '日记',
        featureSleep: '睡眠整理',
        featureFocus: '当前关注点',
        featureJudgeAi: 'AI 判定',
        featureWebSearch: '联网搜索',
        featureEvolve: '自我进化沙盒',
        featureGroupSearch: '检索',
        featureGroupOrganize: '整理',
        featureGroupLife: '生活',
        featureGroupSafety: '安全',
        featureImplemented: '本插件已接',
        featureIntent: '仅记录意图',
        timelineHint: '只读：journal 的 core/专题写入 + sparks.json 的存卡/改卡/归档，双源合并。',
        timelineEmpty: '还没有可展示的变更。',
        timelineLoadMore: '加载更多',
        timelineScanLimited: 'journal 太多，只扫了最新 1000 个文件；更早的记录本次不可达。',
        timelineCorrupted: '有 {count} 条记录损坏，已跳过。',
        timelineJournal: 'journal',
        timelineSpark: '火花',
        timelineOperation: '操作',
        timelineFilterAll: '全部',
        timelineFilterJournal: 'journal',
        timelineFilterSpark: '火花',
        timelineActionAll: '全部动作',
        on: '开',
        off: '关',
        noArchive: '归档库是空的。',
        archivedAt: '归档于',
        toastStarted: '工作卡已开工：{id}',
        toastCreated: '工作卡已开工。',
        toastUpdated: '已记一笔。',
        toastFinished: '工作卡已收工，进入 7 天冷却。',
        toastArchived: '工作卡已归档。',
        toastFeature: '开关已保存。',
        toastRefreshed: '已刷新。',
        loadingDetail: '读取中…',
        detailError: '这一张读不出来：{error}',
        scopeGlobal: 'global（共享）',
        serviceConnected: '伴生服务 v{version}',
        serviceFallback: '文件 fallback',
        edit: '编辑',
        save: '保存',
        cancel: '取消',
        previewDiff: '预览变更',
        backToEdit: '返回编辑',
        editCore: '编辑 L1 核心',
        editPersona: '编辑 L0 人设',
        editTopic: '编辑专题',
        topicTitle: '标题',
        topicSummary: '摘要',
        body: '正文',
        diffTitle: '变更预览',
        needService: '需要 shioriCompanion v1 与 revision 才能写入',
        savedToast: '已保存。',
        saveFailed: '保存失败：{error}',
        conflictReload: '内容已被其他窗口改过，请关掉编辑重新加载。',
        backupAt: '备份：{path}',
        unknown: '未知',
      },
      en: {
        navLabel: 'Memory board',
        title: 'Memory board',
        subtitle: "Little Fish's layered memory · L0–L3 · read-only shiori data",
        refresh: 'Refresh',
        loading: 'Reading…',
        retry: 'Retry',
        close: 'Close',
        error: 'Something went wrong',
        empty: '(empty)',
        scope: 'Scope',
        generated: 'Read at',
        tabOverview: 'Overview',
        tabSparks: 'Sparks',
        tabWork: 'Work cards',
        tabTopics: 'Topics',
        tabFeatures: 'Switches',
        tabArchive: 'Archive',
        tabDepth: 'Depth',
        depthTitle: 'Depth state',
        depthHint: 'Local companion modules: hippocampus, context, verification, affect, dreams/diary. Never writes shiori L0–L3.',
        depthFocus: 'Focus',
        depthHealth: 'Health',
        depthQueue: 'Queue',
        depthHippo: 'Hippocampus',
        depthContext: 'Semantic context',
        depthVerify: 'Pending verify',
        depthAffect: 'Affect',
        depthCustom: 'Custom areas',
        depthDream: 'Recent dreams',
        depthEmpty: '(empty)',
        depthError: 'Depth state unavailable',
        customCreate: 'New custom area',
        customId: 'id (lowercase/hyphen)',
        customName: 'Name',
        customTtl: 'TTL days',
        customMax: 'Max entries',
        customCreateBtn: 'Create',
        customFeed: 'Write one',
        customSave: 'Save',
        customClear: 'Clear input',
        customNeedFeature: 'Turn on features.custom_areas in Switches before creating/writing.',
        customCreated: 'Custom area created.',
        customSaved: 'Written to custom area.',
        customEmpty: 'No custom areas yet.',
        customEntries: 'Recent entries',
        tabSetup: 'Setup',
        setupTitle: 'Setup wizard',
        setupHint: 'Check dataRoot / stateRoot / shioriCompanion and generate a paste-ready cordis.patch.yml snippet.',
        setupCopy: 'Copy snippet',
        setupCopied: 'Copied',
        setupOk: 'OK',
        setupFail: 'FAIL',
        setupOptional: 'optional',
        setupWarn: 'Warning',
        tabTimeline: 'Timeline',
        kpiActiveSparks: 'Active sparks',
        kpiTopics: 'Topics',
        kpiActiveWork: 'Active work',
        kpiFeatures: 'Switches on',
        l0Name: 'L0 Persona',
        l0Desc: 'Always present; sets the baseline',
        l1Name: 'L1 Core memory',
        l1Desc: 'Injected every turn; over budget sinks first',
        l2Name: 'L2 Spark cards',
        l2Desc: 'Floats back on triggers; never resident',
        l3Name: 'L3 Topics',
        l3Desc: 'Expanded on demand; one index line',
        chars: 'chars',
        target: 'soft target',
        hard: 'hard cap',
        budget: 'limit',
        fallback: 'global fallback',
        present: 'present',
        missing: 'missing',
        activeCount: '{count} active',
        retiredCount: '{count} retired',
        topicCount: '{count}',
        archiveCount: '{count}',
        workCount: '{count}',
        recentSparks: 'Recent sparks',
        activeWork: 'Active work',
        diagnostics: 'Diagnostics',
        noDiagnostics: 'No data problems found.',
        sparkSearch: 'Search title, summary, triggers or entities',
        filterAll: 'All',
        filterActive: 'Active',
        filterRetired: 'Retired',
        noSparks: 'No matching spark cards.',
        selectSpark: 'Pick a card on the left to read it.',
        triggers: 'Triggers',
        entities: 'Entities',
        links: 'Links',
        updated: 'Updated',
        file: 'File',
        summary: 'Summary',
        content: 'Content',
        newWorkTitle: 'New work-card title',
        newWorkGoal: 'Definition of done (optional)',
        startWork: 'Start',
        workActive: 'Active',
        workArchived: 'Archived',
        statusActive: 'Active',
        statusStagnated: 'Stagnated',
        statusDone: 'Ready to archive',
        statusArchived: 'Archived',
        noWork: 'No work cards yet.',
        notePlaceholder: 'One line of progress…',
        addStep: 'Add step',
        addDecision: 'Add decision',
        addArtifact: 'Add artifact',
        outcomePlaceholder: 'Outcome…',
        finishWork: 'Finish (start cooldown)',
        archiveWork: 'Archive',
        archiveCooling: 'Cooling down; archive after {time}',
        finishHint: 'Finishing starts a 7-day cooldown; archiving only works after it.',
        steps: 'Steps',
        decisions: 'Decisions',
        artifacts: 'Artifacts',
        wakeWords: 'Wake words',
        noTopics: 'No topics yet.',
        topicHint: 'Pick a topic on the left to read it.',
        topicReadOnly: 'Body is read-only here; writes still go through shiori memory_rewrite.',
        featureHint: 'These 18 switches record intent only; the memory-tools scripts still do the work. They never change shiori memory.',
        featureRecall: 'Memory recall',
        featureHealth: 'Memory health',
        featureJudge: 'Judge & feedback',
        featureCollect: 'Daily collect',
        featureArchive: 'Archive library',
        featureSnapshot: 'Snapshot export',
        featureGraph: 'Spark graph',
        featureWebLearn: 'Web summaries',
        featurePromptSection: 'Prompt section',
        featureVector: 'Vector recall',
        featureCustomAreas: 'Custom memory areas',
        featureDream: 'Dream notes',
        featureDiary: 'Diary',
        featureSleep: 'Sleep consolidation',
        featureFocus: 'Current focus',
        featureJudgeAi: 'AI judging',
        featureWebSearch: 'Web search',
        featureEvolve: 'Evolution sandbox',
        featureGroupSearch: 'Retrieval',
        featureGroupOrganize: 'Organize',
        featureGroupLife: 'Life',
        featureGroupSafety: 'Safety',
        featureImplemented: 'wired in this plugin',
        featureIntent: 'intent only',
        timelineHint: 'Read-only: journal core/topic writes plus sparks.json save/update/archive operations, merged from both sources.',
        timelineEmpty: 'No changes to show yet.',
        timelineLoadMore: 'Load more',
        timelineScanLimited: 'Too many journal files; only the newest 1000 were scanned. Earlier history is unreachable in this view.',
        timelineCorrupted: '{count} corrupted record(s) were skipped.',
        timelineJournal: 'journal',
        timelineSpark: 'spark',
        timelineOperation: 'Operation',
        timelineFilterAll: 'All',
        timelineFilterJournal: 'journal',
        timelineFilterSpark: 'spark',
        timelineActionAll: 'All actions',
        on: 'on',
        off: 'off',
        noArchive: 'The archive is empty.',
        archivedAt: 'Archived',
        toastStarted: 'Work card started: {id}',
        toastCreated: 'Work card started.',
        toastUpdated: 'Saved.',
        toastFinished: 'Work card finished; 7-day cooldown started.',
        toastArchived: 'Work card archived.',
        toastFeature: 'Switch saved.',
        toastRefreshed: 'Refreshed.',
        loadingDetail: 'Reading…',
        detailError: 'Could not read this card: {error}',
        scopeGlobal: 'global (shared)',
        serviceConnected: 'companion service v{version}',
        serviceFallback: 'file fallback',
        edit: 'Edit',
        save: 'Save',
        cancel: 'Cancel',
        previewDiff: 'Preview changes',
        backToEdit: 'Back to edit',
        editCore: 'Edit L1 core',
        editPersona: 'Edit L0 persona',
        editTopic: 'Edit topic',
        topicTitle: 'Title',
        topicSummary: 'Summary',
        body: 'Body',
        diffTitle: 'Change preview',
        needService: 'shioriCompanion v1 and a revision are required to write',
        savedToast: 'Saved.',
        saveFailed: 'Save failed: {error}',
        conflictReload: 'This content was changed elsewhere. Close and reload before saving.',
        backupAt: 'Backup: {path}',
        unknown: 'unknown',
      },
    };

    const CSS = `
.dshmb_root{height:100%;overflow:auto;box-sizing:border-box;padding:22px 26px 40px;color:var(--dsw-alias-label-primary,#1f2329);background:var(--dsw-alias-bg-base,#fff);font:14px/1.55 "Segoe UI","Microsoft YaHei",system-ui,sans-serif}
.dshmb_root *{box-sizing:border-box}
.dshmb_header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:18px}
.dshmb_title{font-size:21px;line-height:1.2;margin:0 0 5px;font-weight:650;letter-spacing:-.2px}
.dshmb_subtitle{margin:0;color:var(--dsw-alias-label-secondary,#6b7280);font-size:12px}
.dshmb_scope{display:inline-flex;align-items:center;gap:6px;margin-top:8px;font-size:11px;color:var(--dsw-alias-label-secondary,#6b7280)}
.dshmb_pill{display:inline-block;padding:1px 8px;border:1px solid var(--dsw-alias-border-l1,#e5e7eb);border-radius:999px;font-size:11px;color:var(--dsw-alias-label-secondary,#6b7280)}
.dshmb_actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:flex-end}
.dshmb_btn{appearance:none;border:1px solid var(--dsw-alias-border-l1,#e5e7eb);background:var(--dsw-alias-bg-layer-1,#fff);color:var(--dsw-alias-label-primary,#1f2329);border-radius:8px;padding:6px 11px;font:inherit;font-size:12px;cursor:pointer;transition:border-color .12s,background .12s}
.dshmb_btn:hover:not(:disabled){border-color:var(--dsw-alias-brand-primary,#2f6fed);color:var(--dsw-alias-brand-primary,#2f6fed)}
.dshmb_btn:disabled{opacity:.5;cursor:not-allowed}
.dshmb_btnPrimary{border-color:var(--dsw-alias-brand-primary,#2f6fed);background:var(--dsw-alias-brand-primary,#2f6fed);color:#fff}
.dshmb_btnPrimary:hover:not(:disabled){filter:brightness(1.04);color:#fff}
.dshmb_btnDanger{border-color:var(--dsw-alias-state-error-primary,#d33);color:var(--dsw-alias-state-error-primary,#d33)}
.dshmb_btnDanger:hover:not(:disabled){background:var(--dsw-alias-state-error-primary,#d33);color:#fff}
.dshmb_banner{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:9px 12px;margin:0 0 14px;border:1px solid var(--dsw-alias-state-error-primary,#d33);border-radius:9px;color:var(--dsw-alias-state-error-primary,#d33);background:color-mix(in srgb,var(--dsw-alias-state-error-primary,#d33) 7%,transparent);font-size:12px}
.dshmb_toast{display:flex;align-items:center;gap:8px;padding:8px 12px;margin:0 0 14px;border:1px solid var(--dsw-alias-state-success-primary,#198754);border-radius:9px;color:var(--dsw-alias-state-success-primary,#198754);background:color-mix(in srgb,var(--dsw-alias-state-success-primary,#198754) 8%,transparent);font-size:12px}
.dshmb_kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:18px}
.dshmb_kpi{border:1px solid var(--dsw-alias-border-l1,#e5e7eb);background:var(--dsw-alias-bg-layer-1,#fff);border-radius:12px;padding:11px 13px;min-width:0}
.dshmb_kpiValue{font-size:22px;font-weight:650;line-height:1.1;letter-spacing:-.3px}
.dshmb_kpiLabel{margin-top:4px;font-size:11px;color:var(--dsw-alias-label-secondary,#6b7280);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dshmb_tabs{display:flex;gap:2px;border-bottom:1px solid var(--dsw-alias-border-l1,#e5e7eb);margin-bottom:18px;overflow-x:auto}
.dshmb_tab{appearance:none;border:0;background:transparent;color:var(--dsw-alias-label-secondary,#6b7280);padding:8px 11px;border-bottom:2px solid transparent;font:inherit;font-size:12px;cursor:pointer;white-space:nowrap}
.dshmb_tab:hover{color:var(--dsw-alias-label-primary,#1f2329)}
.dshmb_tab.is-active{color:var(--dsw-alias-brand-primary,#2f6fed);border-bottom-color:var(--dsw-alias-brand-primary,#2f6fed);font-weight:600}
.dshmb_grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.dshmb_card{border:1px solid var(--dsw-alias-border-l1,#e5e7eb);background:var(--dsw-alias-bg-layer-1,#fff);border-radius:12px;padding:13px 15px;min-width:0}
.dshmb_cardHead{display:flex;align-items:baseline;justify-content:space-between;gap:8px;margin-bottom:7px}
.dshmb_cardActions{display:flex;align-items:center;gap:6px;flex-wrap:wrap;justify-content:flex-end}
.dshmb_cardTitle{font-size:13px;font-weight:650;margin:0}
.dshmb_cardDesc{font-size:11px;color:var(--dsw-alias-label-secondary,#6b7280);margin:0 0 10px}
.dshmb_meter{height:6px;border-radius:999px;background:var(--dsw-alias-bg-layer-2,#f1f3f5);overflow:hidden;margin:8px 0 6px}
.dshmb_meterFill{height:100%;border-radius:999px;background:var(--dsw-alias-state-success-primary,#198754);transition:width .2s}
.dshmb_meterFill.is-warn{background:var(--dsw-alias-state-warn-primary,#c47f00)}
.dshmb_meterFill.is-danger{background:var(--dsw-alias-state-error-primary,#d33)}
.dshmb_note{font-size:11px;color:var(--dsw-alias-label-secondary,#6b7280)}
.dshmb_path{font:10px/1.45 "Cascadia Code","Consolas",monospace;color:var(--dsw-alias-label-secondary,#6b7280);word-break:break-all;margin-top:4px;opacity:.86}
.dshmb_list{display:flex;flex-direction:column;gap:6px;margin-top:8px}
.dshmb_listRow{display:flex;align-items:baseline;gap:8px;min-width:0}
.dshmb_listRow b{font-weight:550;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dshmb_listRow span{color:var(--dsw-alias-label-secondary,#6b7280);font-size:11px;white-space:nowrap}
.dshmb_diag{margin:4px 0 0;padding-left:18px;color:var(--dsw-alias-state-warn-primary,#c47f00);font-size:12px}
.dshmb_split{display:grid;grid-template-columns:minmax(0,.95fr) minmax(0,1.25fr);gap:14px;align-items:start}
.dshmb_panel{border:1px solid var(--dsw-alias-border-l1,#e5e7eb);background:var(--dsw-alias-bg-layer-1,#fff);border-radius:12px;min-width:0;overflow:hidden}
.dshmb_panelHead{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 12px;border-bottom:1px solid var(--dsw-alias-border-l1,#e5e7eb)}
.dshmb_panelTitle{font-size:12px;font-weight:650}
.dshmb_scroll{max-height:calc(100vh - 330px);overflow:auto}
.dshmb_row{appearance:none;display:flex;align-items:flex-start;justify-content:space-between;gap:10px;width:100%;border:0;border-bottom:1px solid var(--dsw-alias-border-l1,#e5e7eb);background:transparent;color:inherit;text-align:left;padding:9px 12px;font:inherit;cursor:pointer}
.dshmb_row:last-child{border-bottom:0}
.dshmb_row:hover{background:var(--dsw-alias-bg-layer-2,#f6f7f8)}
.dshmb_row.is-selected{background:color-mix(in srgb,var(--dsw-alias-brand-primary,#2f6fed) 8%,transparent)}
.dshmb_rowMain{min-width:0;flex:1}
.dshmb_rowTitle{font-size:12px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dshmb_rowSub{font-size:11px;color:var(--dsw-alias-label-secondary,#6b7280);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dshmb_badges{display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end;flex-shrink:0}
.dshmb_badge{display:inline-block;padding:1px 6px;border:1px solid var(--dsw-alias-border-l1,#e5e7eb);border-radius:999px;font-size:10px;color:var(--dsw-alias-label-secondary,#6b7280);white-space:nowrap}
.dshmb_badge.is-active{color:var(--dsw-alias-state-success-primary,#198754);border-color:color-mix(in srgb,var(--dsw-alias-state-success-primary,#198754) 45%,transparent)}
.dshmb_search{width:100%;appearance:none;border:1px solid var(--dsw-alias-border-l1,#e5e7eb);background:var(--dsw-alias-bg-base,#fff);color:inherit;border-radius:8px;padding:7px 10px;font:inherit;font-size:12px;margin:9px 12px;width:calc(100% - 24px)}
.dshmb_filters{display:flex;gap:5px;padding:0 12px 9px;flex-wrap:wrap}
.dshmb_filter{appearance:none;border:1px solid var(--dsw-alias-border-l1,#e5e7eb);background:transparent;color:var(--dsw-alias-label-secondary,#6b7280);border-radius:999px;padding:2px 9px;font:inherit;font-size:11px;cursor:pointer}
.dshmb_filter.is-active{border-color:var(--dsw-alias-brand-primary,#2f6fed);color:var(--dsw-alias-brand-primary,#2f6fed)}
.dshmb_detail{padding:13px 14px}
.dshmb_detailHead{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:8px}
.dshmb_detailTitle{font-size:14px;font-weight:650;margin:0;line-height:1.3}
.dshmb_pre{white-space:pre-wrap;word-break:break-word;font:12px/1.65 "Cascadia Code","Consolas",monospace;background:var(--dsw-alias-bg-layer-2,#f6f7f8);border:1px solid var(--dsw-alias-border-l1,#e5e7eb);border-radius:8px;padding:10px;margin:10px 0 0;max-height:50vh;overflow:auto}
.dshmb_meta{display:grid;grid-template-columns:auto 1fr;gap:3px 10px;font-size:11px;margin-top:8px}
.dshmb_metaKey{color:var(--dsw-alias-label-secondary,#6b7280);white-space:nowrap}
.dshmb_metaVal{min-width:0;word-break:break-word}
.dshmb_chips{display:flex;flex-wrap:wrap;gap:4px;margin-top:4px}
.dshmb_chip{font-size:10px;padding:1px 7px;border-radius:999px;border:1px solid var(--dsw-alias-border-l1,#e5e7eb);color:var(--dsw-alias-label-secondary,#6b7280)}
.dshmb_empty{padding:26px 14px;text-align:center;color:var(--dsw-alias-label-secondary,#6b7280);font-size:12px}
.dshmb_workForm{display:grid;grid-template-columns:1.1fr 1.5fr auto;gap:8px;margin-bottom:12px}
.dshmb_input{appearance:none;width:100%;border:1px solid var(--dsw-alias-border-l1,#e5e7eb);background:var(--dsw-alias-bg-layer-1,#fff);color:inherit;border-radius:8px;padding:7px 9px;font:inherit;font-size:12px}
.dshmb_input:focus{outline:2px solid color-mix(in srgb,var(--dsw-alias-brand-primary,#2f6fed) 30%,transparent);outline-offset:1px}
.dshmb_workList{display:flex;flex-direction:column;gap:10px}
.dshmb_work{border:1px solid var(--dsw-alias-border-l1,#e5e7eb);background:var(--dsw-alias-bg-layer-1,#fff);border-radius:11px;padding:12px 13px}
.dshmb_workHead{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}
.dshmb_workTitle{font-size:13px;font-weight:650;margin:0}
.dshmb_workGoal{font-size:11px;color:var(--dsw-alias-label-secondary,#6b7280);margin-top:2px}
.dshmb_workStats{display:flex;gap:10px;flex-wrap:wrap;font-size:11px;color:var(--dsw-alias-label-secondary,#6b7280);margin:7px 0}
.dshmb_workActions{display:grid;grid-template-columns:1fr auto auto;gap:6px;margin-top:6px}
.dshmb_workFinish{display:grid;grid-template-columns:1fr auto;gap:6px;margin-top:6px}
.dshmb_entries{margin-top:7px;border-top:1px dashed var(--dsw-alias-border-l1,#e5e7eb);padding-top:6px;display:flex;flex-direction:column;gap:2px}
.dshmb_entry{font-size:11px;color:var(--dsw-alias-label-secondary,#6b7280);display:flex;gap:7px}
.dshmb_entry b{font-weight:600;color:var(--dsw-alias-label-primary,#1f2329);white-space:nowrap}
.dshmb_feature{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:11px 2px;border-bottom:1px solid var(--dsw-alias-border-l1,#e5e7eb)}
.dshmb_feature:last-child{border-bottom:0}
.dshmb_featureGroup{margin-top:10px}
.dshmb_featureGroupTitle{font-size:11px;font-weight:650;color:var(--dsw-alias-label-secondary,#6b7280);padding:6px 2px 2px;border-bottom:1px solid var(--dsw-alias-border-l1,#e5e7eb)}
.dshmb_featureState{font-size:10px;color:var(--dsw-alias-label-secondary,#6b7280);white-space:nowrap}
.dshmb_featureName{font-size:12px;font-weight:600}
.dshmb_featureKey{font-size:10px;color:var(--dsw-alias-label-secondary,#6b7280);margin-top:1px}
.dshmb_switch{appearance:none;width:38px;height:21px;border-radius:999px;border:1px solid var(--dsw-alias-border-l2,#cfd4dc);background:var(--dsw-alias-bg-layer-2,#eef0f3);position:relative;cursor:pointer;flex-shrink:0;transition:background .15s,border-color .15s}
.dshmb_switch.is-on{background:var(--dsw-alias-brand-primary,#2f6fed);border-color:var(--dsw-alias-brand-primary,#2f6fed)}
.dshmb_knob{position:absolute;top:2px;left:2px;width:15px;height:15px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.2);transition:transform .15s}
.dshmb_switch.is-on .dshmb_knob{transform:translateX(17px)}
.dshmb_archiveRow{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;padding:9px 2px;border-bottom:1px solid var(--dsw-alias-border-l1,#e5e7eb)}
.dshmb_archiveRow:last-child{border-bottom:0}
.dshmb_depthGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px;margin-top:10px}
.dshmb_depthCard{border:1px solid var(--dsw-alias-border-l1,#e5e7eb);border-radius:8px;padding:10px;background:var(--dsw-alias-bg-layer-2,#f6f7f8)}
.dshmb_depthCard b{display:block;font-size:11px;margin-bottom:4px;color:var(--dsw-alias-label-secondary,#6b7280)}
.dshmb_depthCard .dshmb_note{font-size:12px;line-height:1.5}
.dshmb_areaForm{display:grid;grid-template-columns:1.2fr 1.4fr .7fr .7fr auto;gap:6px;margin-top:8px;align-items:center}
.dshmb_areaForm .dshmb_input{min-width:0}
.dshmb_areaItem{border:1px solid var(--dsw-alias-border-l1,#e5e7eb);border-radius:8px;padding:9px;margin-top:9px;background:var(--dsw-alias-bg-layer-2,#f6f7f8)}
.dshmb_areaHead{font-size:12px;font-weight:650;margin-bottom:5px}
.dshmb_areaText{width:100%;min-height:56px;resize:vertical;border:1px solid var(--dsw-alias-border-l1,#e5e7eb);border-radius:6px;background:var(--dsw-alias-bg-base,#fff);color:inherit;font:12px/1.5 inherit;padding:7px;margin-top:6px}
.dshmb_ok{color:var(--dsw-alias-state-success-primary,#198754);font-size:11px;font-weight:650}
.dshmb_optional{color:var(--dsw-alias-label-secondary,#6b7280);font-size:11px;font-weight:650}
.dshmb_bad{color:var(--dsw-alias-state-error-primary,#d33);font-size:11px;font-weight:650}
.dshmb_loading{padding:34px 10px;text-align:center;color:var(--dsw-alias-label-secondary,#6b7280);font-size:12px}
.dshmb_modalBackdrop{position:fixed;inset:0;z-index:80;background:rgba(0,0,0,.38);display:flex;align-items:center;justify-content:center;padding:24px}
.dshmb_modal{width:min(920px,96vw);max-height:90vh;overflow:auto;background:var(--dsw-alias-bg-base,#fff);border:1px solid var(--dsw-alias-border-l2,#cfd4dc);border-radius:14px;padding:16px 18px;box-shadow:0 18px 60px rgba(0,0,0,.28)}
.dshmb_modalHead{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}
.dshmb_modalTitle{font-size:15px;font-weight:650;margin:0}
.dshmb_field{display:flex;flex-direction:column;gap:4px;margin:8px 0;font-size:11px;color:var(--dsw-alias-label-secondary,#6b7280)}
.dshmb_textarea{width:100%;min-height:340px;resize:vertical;border:1px solid var(--dsw-alias-border-l1,#e5e7eb);border-radius:8px;background:var(--dsw-alias-bg-layer-2,#f6f7f8);color:inherit;font:12px/1.6 "Cascadia Code","Consolas",monospace;padding:10px}
.dshmb_diff{max-height:52vh;overflow:auto;background:var(--dsw-alias-bg-layer-2,#f6f7f8);border:1px solid var(--dsw-alias-border-l1,#e5e7eb);border-radius:8px;padding:8px 10px;font:12px/1.55 "Cascadia Code","Consolas",monospace;white-space:pre-wrap}
.dshmb_diffLine.is-add{color:var(--dsw-alias-state-success-primary,#198754);background:color-mix(in srgb,var(--dsw-alias-state-success-primary,#198754) 8%,transparent)}
.dshmb_diffLine.is-del{color:var(--dsw-alias-state-error-primary,#d33);background:color-mix(in srgb,var(--dsw-alias-state-error-primary,#d33) 8%,transparent)}
.dshmb_modalFoot{display:flex;align-items:center;gap:8px;margin-top:10px}
.dshmb_hint{font-size:11px;color:var(--dsw-alias-label-secondary,#6b7280);margin:8px 0 0}
.dshmb_warn{color:var(--dsw-alias-state-warn-primary,#c47f00);margin-top:5px}
.dshmb_select{appearance:none;border:1px solid var(--dsw-alias-border-l1,#e5e7eb);background:var(--dsw-alias-bg-layer-1,#fff);color:inherit;border-radius:8px;padding:5px 9px;font:inherit;font-size:12px;cursor:pointer}
.dshmb_timeline{display:flex;flex-direction:column;margin-top:8px}
.dshmb_timelineFilters{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-top:8px}
.dshmb_timelineDay{margin-top:8px}
.dshmb_timelineDayTitle{font-size:11px;font-weight:650;color:var(--dsw-alias-label-secondary,#6b7280);padding:5px 0;border-bottom:1px solid var(--dsw-alias-border-l1,#e5e7eb)}
.dshmb_timelineRow{display:grid;grid-template-columns:118px minmax(0,1fr);gap:10px;padding:8px 0;border-bottom:1px solid var(--dsw-alias-border-l1,#e5e7eb)}
.dshmb_timelineRow:last-child{border-bottom:0}
.dshmb_timelineTime{font:10px/1.5 "Cascadia Code","Consolas",monospace;color:var(--dsw-alias-label-secondary,#6b7280);white-space:nowrap}
.dshmb_timelineBody{min-width:0}
.dshmb_timelineTop{display:flex;align-items:center;gap:5px;flex-wrap:wrap;min-width:0}
.dshmb_timelineTop b{font-size:12px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%}
@media (max-width:900px){.dshmb_kpis{grid-template-columns:repeat(2,minmax(0,1fr))}.dshmb_split{grid-template-columns:1fr}.dshmb_workForm{grid-template-columns:1fr}.dshmb_grid{grid-template-columns:1fr}.dshmb_scroll{max-height:none}.dshmb_timelineRow{grid-template-columns:1fr;gap:2px}}
`;

    function BoardIcon({ size = 18, active = false }) {
      return h('svg', {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        'aria-hidden': true,
        style: { display: 'block', opacity: active ? 1 : 0.82 },
      }, [
        h('rect', { key: 'a', x: 3.2, y: 4.4, width: 17.6, height: 15.2, rx: 4.2, stroke: 'currentColor', strokeWidth: 1.6 }),
        h('path', { key: 'b', d: 'M7 9h10M7 12.2h7.4M7 15.4h5.2', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' }),
        h('circle', { key: 'c', cx: 17.1, cy: 15.4, r: 1.05, fill: 'currentColor' }),
      ]);
    }

    function useLocaleSnapshot(ctx) {
      return useSyncExternalStore(
        (listener) => ctx.locale.subscribe(listener),
        () => ctx.locale.getSnapshot(),
        () => ctx.locale.getSnapshot(),
      );
    }

    function fmtTime(value) {
      if (!value) return '—';
      return String(value).slice(0, 16).replace('T', ' ');
    }

    function fmtKB(bytes) {
      if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB';
      return `${Math.round((bytes / 1024) * 10) / 10} KB`;
    }

    function shortPath(value) {
      const parts = String(value || '').split(/[\\/]+/).filter(Boolean);
      return parts.length > 2 ? `…/${parts.slice(-2).join('/')}` : String(value || '');
    }

    function percent(value, max) {
      if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) return '0%';
      return `${Math.round((Math.min(1, Math.max(0, value / max))) * 100)}%`;
    }

    const FEATURE_DICT_NAMES = {
      web_learn: 'WebLearn',
      prompt_section: 'PromptSection',
      custom_areas: 'CustomAreas',
      judge_ai: 'JudgeAi',
      web_search: 'WebSearch',
    };

    const FEATURE_GROUPS = [
      { key: 'featureGroupSearch', keys: ['features.recall', 'features.vector', 'features.graph', 'features.web_search'] },
      { key: 'featureGroupOrganize', keys: ['features.health', 'features.judge', 'features.judge_ai', 'features.collect', 'features.archive', 'features.snapshot', 'features.evolve'] },
      { key: 'featureGroupLife', keys: ['features.dream', 'features.diary', 'features.sleep', 'features.focus'] },
      { key: 'featureGroupSafety', keys: ['features.web_learn', 'features.prompt_section', 'features.custom_areas'] },
    ];

    function featureLabelKey(key) {
      const name = String(key).replace(/^features\./, '');
      const camel = FEATURE_DICT_NAMES[name] ?? `${name.charAt(0).toUpperCase()}${name.slice(1)}`;
      return `feature${camel}`;
    }

    async function api(path, init = {}) {
      const headers = { ...(init.headers || {}) };
      if (init.body) {
        headers['content-type'] = 'application/json';
        headers['x-shiori-companion'] = '1';
      }
      const response = await fetch(`${API}${path}`, {
        cache: 'no-store',
        credentials: 'same-origin',
        ...init,
        headers,
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload.ok === false) {
        const error = new Error(payload.error || `HTTP ${response.status}`);
        error.code = payload.code ?? null;
        error.status = response.status;
        throw error;
      }
      return payload;
    }

    function Badge({ children, active = false }) {
      return h('span', { className: `dshmb_badge${active ? ' is-active' : ''}` }, children);
    }

    function Meter({ value, max }) {
      const ratio = max > 0 ? Math.min(1, value / max) : 0;
      const tone = ratio >= 0.9 ? ' is-danger' : ratio >= 0.75 ? ' is-warn' : '';
      return h('div', { className: 'dshmb_meter' }, h('div', {
        className: `dshmb_meterFill${tone}`,
        style: { width: `${Math.round(ratio * 100)}%` },
      }));
    }

    function Empty({ children }) {
      return h('div', { className: 'dshmb_empty' }, children);
    }

    function diffLines(oldText, newText) {
      const a = String(oldText ?? '').split('\n');
      const b = String(newText ?? '').split('\n');
      if (a.length * b.length > 600000) {
        return [{ type: 'same', text: b.join('\n') }];
      }
      const dp = Array.from({ length: a.length + 1 }, () => new Uint16Array(b.length + 1));
      for (let i = 1; i <= a.length; i += 1) {
        for (let j = 1; j <= b.length; j += 1) {
          dp[i][j] = a[i - 1] === b[j - 1]
            ? dp[i - 1][j - 1] + 1
            : Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
      const out = [];
      let i = a.length;
      let j = b.length;
      while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
          out.push({ type: 'same', text: a[i - 1] });
          i -= 1;
          j -= 1;
        } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
          out.push({ type: 'add', text: b[j - 1] });
          j -= 1;
        } else {
          out.push({ type: 'del', text: a[i - 1] });
          i -= 1;
        }
      }
      return out.reverse();
    }

    function EditorModal({ t, editor, busy, onClose, onSave }) {
      const [body, setBody] = useState(editor.initialBody ?? '');
      const [fields, setFields] = useState(editor.fields ?? {});
      const [showDiff, setShowDiff] = useState(false);
      const diff = showDiff ? diffLines(editor.initialBody ?? '', body) : [];
      const updateField = (key, value) => setFields((current) => ({ ...current, [key]: value }));
      return h('div', { className: 'dshmb_modalBackdrop' }, h('div', { className: 'dshmb_modal', role: 'dialog', 'aria-modal': 'true' }, [
        h('div', { key: 'head', className: 'dshmb_modalHead' }, [
          h('h3', { key: 't', className: 'dshmb_modalTitle' }, editor.title),
          h('button', { key: 'x', type: 'button', className: 'dshmb_btn', onClick: onClose }, t('cancel')),
        ]),
        editor.error ? h('div', { key: 'err', className: 'dshmb_banner' }, editor.error) : null,
        ...Object.entries(editor.fieldDefs ?? []).map(([key, label]) => h('label', { key: `f-${key}`, className: 'dshmb_field' }, [
          h('span', { key: 'l' }, label),
          h('input', {
            key: 'i',
            className: 'dshmb_input',
            value: fields[key] ?? '',
            onChange: (event) => updateField(key, event.target.value),
          }),
        ])),
        showDiff ? h('pre', { key: 'diff', className: 'dshmb_diff' }, diff.map((line, index) => h('div', {
          key: index,
          className: `dshmb_diffLine is-${line.type}`,
        }, `${line.type === 'add' ? '+' : line.type === 'del' ? '-' : ' '} ${line.text}`))) : h('textarea', {
          key: 'body',
          className: 'dshmb_textarea',
          value: body,
          spellCheck: false,
          onChange: (event) => setBody(event.target.value),
        }),
        h('div', { key: 'foot', className: 'dshmb_modalFoot' }, [
          h('span', { key: 'c', className: 'dshmb_note' }, `${t('chars')} ${body.length}`),
          h('div', { key: 'b', style: { display: 'flex', gap: 8, marginLeft: 'auto' } }, [
            h('button', {
              key: 'p',
              type: 'button',
              className: 'dshmb_btn',
              onClick: () => setShowDiff((value) => !value),
            }, showDiff ? t('backToEdit') : t('previewDiff')),
            h('button', {
              key: 's',
              type: 'button',
              className: 'dshmb_btn dshmb_btnPrimary',
              disabled: busy,
              onClick: () => onSave({ body, fields }),
            }, busy ? t('loading') : t('save')),
          ]),
        ]),
      ]));
    }

    function DetailError({ error, t }) {
      return h('div', { className: 'dshmb_empty' }, t('detailError', { error }));
    }

    function Overview({ data, t, onGoWork, onEditCore, onEditPersona }) {
      const active = data.sparks.active;
      const activeWork = data.work.filter((card) => card.effectiveStatus === 'active' || card.effectiveStatus === 'stagnated');
      const on = Object.values(data.features).filter(Boolean).length;
      return h('div', null, [
        h('div', { key: 'grid', className: 'dshmb_grid' }, [
          h('section', { key: 'l0', className: 'dshmb_card' }, [
            h('div', { className: 'dshmb_cardHead' }, [
              h('h3', { className: 'dshmb_cardTitle' }, t('l0Name')),
              h('div', { key: 'a', className: 'dshmb_cardActions' }, [
                h('button', {
                  key: 'e',
                  type: 'button',
                  className: 'dshmb_btn',
                  disabled: !data.service?.available,
                  title: data.service?.available ? t('edit') : t('needService'),
                  onClick: onEditPersona,
                }, t('edit')),
                h(Badge, { key: 'b' }, `${data.layers.L0.chars} ${t('chars')}`),
              ]),
            ]),
            h('p', { className: 'dshmb_cardDesc' }, t('l0Desc')),
            h(Meter, { value: data.layers.L0.chars, max: data.layers.L0.budget }),
            h('div', { className: 'dshmb_note' }, `${t('budget')} ${data.layers.L0.budget} ${t('chars')} · ${percent(data.layers.L0.chars, data.layers.L0.budget)} · ${fmtKB(data.layers.L0.bytes)}${data.layers.L0.fallback ? ` · ${t('fallback')}` : ''}`),
            h('div', { className: 'dshmb_path' }, data.layers.L0.file),
          ]),
          h('section', { key: 'l1', className: 'dshmb_card' }, [
            h('div', { className: 'dshmb_cardHead' }, [
              h('h3', { className: 'dshmb_cardTitle' }, t('l1Name')),
              h('div', { key: 'a', className: 'dshmb_cardActions' }, [
                h('button', {
                  key: 'e',
                  type: 'button',
                  className: 'dshmb_btn',
                  disabled: !data.service?.available,
                  title: data.service?.available ? t('editCore') : t('needService'),
                  onClick: onEditCore,
                }, t('edit')),
                h(Badge, { key: 'b' }, `${data.layers.L1.chars} ${t('chars')}`),
              ]),
            ]),
            h('p', { className: 'dshmb_cardDesc' }, t('l1Desc')),
            h(Meter, { value: data.layers.L1.chars, max: data.layers.L1.hard }),
            h('div', { className: 'dshmb_note' }, `${t('target')} ${data.layers.L1.target} · ${t('hard')} ${data.layers.L1.hard} · ${percent(data.layers.L1.chars, data.layers.L1.hard)} · ${fmtKB(data.layers.L1.bytes)}${data.layers.L1.fallback ? ` · ${t('fallback')}` : ''}`),
            h('div', { className: 'dshmb_path' }, data.layers.L1.file),
          ]),
          h('section', { key: 'l2', className: 'dshmb_card' }, [
            h('div', { className: 'dshmb_cardHead' }, [
              h('h3', { className: 'dshmb_cardTitle' }, t('l2Name')),
              h(Badge, { key: 'b' }, `${data.layers.L2.total}`),
            ]),
            h('p', { className: 'dshmb_cardDesc' }, t('l2Desc')),
            h('div', { className: 'dshmb_note' }, `${t('activeCount', { count: data.layers.L2.active })} · ${t('retiredCount', { count: data.layers.L2.retired })}`),
            h('div', { className: 'dshmb_path' }, data.layers.L2.file),
            h('div', { className: 'dshmb_list' }, active.slice(0, 5).map((card) => h('div', { key: card.id, className: 'dshmb_listRow' }, [
              h('b', { key: 't' }, card.title),
              h('span', { key: 'm' }, card.vitality),
            ]))),
          ]),
          h('section', { key: 'l3', className: 'dshmb_card' }, [
            h('div', { className: 'dshmb_cardHead' }, [
              h('h3', { className: 'dshmb_cardTitle' }, t('l3Name')),
              h(Badge, { key: 'b' }, t('topicCount', { count: data.layers.L3.count })),
            ]),
            h('p', { className: 'dshmb_cardDesc' }, t('l3Desc')),
            h('div', { className: 'dshmb_list' }, data.layers.L3.topics.slice(0, 6).map((topic) => h('div', { key: topic.key, className: 'dshmb_listRow' }, [
              h('b', { key: 't' }, topic.title || topic.key),
              h('span', { key: 'm' }, `${topic.chars} ${t('chars')}`),
            ]))),
            h('div', { className: 'dshmb_path' }, data.layers.L3.dir),
          ]),
        ]),
        data.diagnostics.length ? h('section', { key: 'diag', className: 'dshmb_card', style: { marginTop: 12 } }, [
          h('div', { className: 'dshmb_cardHead' }, h('h3', { className: 'dshmb_cardTitle' }, t('diagnostics'))),
          h('ul', { className: 'dshmb_diag' }, data.diagnostics.map((item, index) => h('li', { key: index }, item))),
        ]) : null,
        h('div', { key: 'recent', className: 'dshmb_grid', style: { marginTop: 12 } }, [
          h('section', { key: 's', className: 'dshmb_card' }, [
            h('div', { className: 'dshmb_cardHead' }, [
              h('h3', { className: 'dshmb_cardTitle' }, t('recentSparks')),
              h(Badge, { key: 'b' }, t('activeCount', { count: active.length })),
            ]),
            active.length ? h('div', { className: 'dshmb_list' }, active.slice(0, 8).map((card) => h('div', { key: card.id, className: 'dshmb_listRow' }, [
              h('b', { key: 't' }, card.title),
              h('span', { key: 'm' }, card.vitality),
            ]))) : h(Empty, null, t('noSparks')),
          ]),
          h('section', { key: 'w', className: 'dshmb_card' }, [
            h('div', { className: 'dshmb_cardHead' }, [
              h('h3', { className: 'dshmb_cardTitle' }, t('activeWork')),
              h(Badge, { key: 'b' }, t('workCount', { count: activeWork.length })),
            ]),
            activeWork.length ? h('div', { className: 'dshmb_list' }, activeWork.slice(0, 8).map((card) => h('div', { key: card.id, className: 'dshmb_listRow' }, [
              h('b', { key: 't' }, card.title),
              h('span', { key: 'm' }, `${card.steps.length} ${t('steps')}`),
            ]))) : h('div', { className: 'dshmb_empty' }, [
              h('div', { key: 't' }, t('noWork')),
              h('button', { key: 'b', type: 'button', className: 'dshmb_btn', onClick: onGoWork }, t('startWork')),
            ]),
          ]),
        ]),
        h('div', { key: 'foot', className: 'dshmb_hint' }, `${t('scope')}: ${data.scope === 'global' ? t('scopeGlobal') : data.scope} · ${t('tabFeatures')}: ${on}/18 · ${t('generated')} ${fmtTime(data.generatedAt)}`),
      ]);
    }

    function SparkDetail({ id, scope, t, onEdit }) {
      const [state, setState] = useState({ loading: true, card: null, error: '' });
      useEffect(() => {
        let cancelled = false;
        setState({ loading: true, card: null, error: '' });
        api(`/spark?id=${encodeURIComponent(id)}&scope=${encodeURIComponent(scope)}`)
          .then((payload) => {
            if (!cancelled) setState({ loading: false, card: payload.card, error: '' });
          })
          .catch((error) => {
            if (!cancelled) setState({ loading: false, card: null, error: error.message });
          });
        return () => { cancelled = true; };
      }, [id, scope]);

      if (state.loading) return h('div', { className: 'dshmb_loading' }, t('loadingDetail'));
      if (state.error) return h(DetailError, { error: state.error, t });
      const card = state.card;
      return h('div', { className: 'dshmb_detail' }, [
        h('div', { key: 'head', className: 'dshmb_detailHead' }, [
          h('h3', { key: 't', className: 'dshmb_detailTitle' }, card.title),
          h('div', { key: 'b', className: 'dshmb_badges' }, [
            h('button', {
              key: 'e',
              type: 'button',
              className: 'dshmb_btn',
              disabled: !Number.isInteger(card.revision),
              title: Number.isInteger(card.revision) ? t('edit') : t('needService'),
              onClick: () => onEdit(card),
            }, t('edit')),
            h(Badge, { key: 's', active: card.state === 'active' }, card.state),
            h(Badge, { key: 'v' }, card.vitality),
          ]),
        ]),
        h('div', { key: 'meta', className: 'dshmb_meta' }, [
          h('span', { key: 'u', className: 'dshmb_metaKey' }, t('updated')),
          h('span', { key: 'uv', className: 'dshmb_metaVal' }, fmtTime(card.updatedAt)),
          h('span', { key: 'f', className: 'dshmb_metaKey' }, t('file')),
          h('span', { key: 'fv', className: 'dshmb_metaVal' }, card.file || '—'),
          h('span', { key: 'tr', className: 'dshmb_metaKey' }, t('triggers')),
          h('div', { key: 'trv', className: 'dshmb_chips' }, (card.triggers || []).length
            ? card.triggers.map((item, index) => h('span', { key: index, className: 'dshmb_chip' }, item))
            : h('span', { className: 'dshmb_metaVal' }, '—')),
          h('span', { key: 'en', className: 'dshmb_metaKey' }, t('entities')),
          h('div', { key: 'env', className: 'dshmb_chips' }, (card.entities || []).length
            ? card.entities.map((item, index) => h('span', { key: index, className: 'dshmb_chip' }, item))
            : h('span', { className: 'dshmb_metaVal' }, '—')),
        ]),
        h('pre', { key: 'body', className: 'dshmb_pre' }, card.content || ''),
      ]);
    }

    function Sparks({ data, t, scope, onEditSpark }) {
      const [query, setQuery] = useState('');
      const [filter, setFilter] = useState('active');
      const [selected, setSelected] = useState(null);
      const all = filter === 'all' ? [...data.sparks.active, ...data.sparks.retired]
        : filter === 'retired' ? data.sparks.retired : data.sparks.active;
      const q = query.trim().toLowerCase();
      const cards = q ? all.filter((card) => [
        card.title, card.summary, card.contentPreview, ...(card.triggers || []), ...(card.entities || []),
      ].some((value) => String(value || '').toLowerCase().includes(q))) : all;

      return h('div', { className: 'dshmb_split' }, [
        h('section', { key: 'list', className: 'dshmb_panel' }, [
          h('div', { className: 'dshmb_panelHead' }, [
            h('span', { key: 't', className: 'dshmb_panelTitle' }, t('tabSparks')),
            h(Badge, { key: 'b' }, String(cards.length)),
          ]),
          h('input', {
            key: 'q',
            className: 'dshmb_search',
            value: query,
            placeholder: t('sparkSearch'),
            onChange: (event) => setQuery(event.target.value),
          }),
          h('div', { key: 'f', className: 'dshmb_filters' }, [
            ['all', t('filterAll')],
            ['active', t('filterActive')],
            ['retired', t('filterRetired')],
          ].map(([key, label]) => h('button', {
            key,
            type: 'button',
            className: `dshmb_filter${filter === key ? ' is-active' : ''}`,
            onClick: () => setFilter(key),
          }, label))),
          h('div', { key: 'rows', className: 'dshmb_scroll' }, cards.length ? cards.map((card) => h('button', {
            key: card.id,
            type: 'button',
            className: `dshmb_row${selected === card.id ? ' is-selected' : ''}`,
            onClick: () => setSelected(card.id),
          }, [
            h('div', { key: 'm', className: 'dshmb_rowMain' }, [
              h('div', { key: 't', className: 'dshmb_rowTitle' }, card.title),
              h('div', { key: 's', className: 'dshmb_rowSub' }, card.summary || card.contentPreview || card.id),
            ]),
            h('div', { key: 'b', className: 'dshmb_badges' }, [
              h(Badge, { key: 'v' }, card.vitality),
              h(Badge, { key: 'st', active: card.state === 'active' }, card.state),
            ]),
          ])) : h(Empty, null, t('noSparks'))),
        ]),
        h('section', { key: 'detail', className: 'dshmb_panel' }, selected
          ? h(SparkDetail, { id: selected, scope, t, onEdit: onEditSpark })
          : h(Empty, null, t('selectSpark'))),
      ]);
    }

    function WorkCard({ card, t, busy, onUpdate, onFinish, onArchive }) {
      const [note, setNote] = useState('');
      const [outcome, setOutcome] = useState('');
      const status = card.effectiveStatus || card.status || 'active';
      const statusKey = `status${status.charAt(0).toUpperCase()}${status.slice(1)}`;
      const canWork = status === 'active' || status === 'stagnated';
      const isDone = status === 'done';
      const cooling = isDone && card.coolingUntil && Date.parse(card.coolingUntil) > Date.now();
      return h('article', { className: 'dshmb_work' }, [
        h('div', { key: 'head', className: 'dshmb_workHead' }, [
          h('div', { key: 'l', style: { minWidth: 0 } }, [
            h('h3', { key: 't', className: 'dshmb_workTitle' }, card.title),
            card.goal ? h('div', { key: 'g', className: 'dshmb_workGoal' }, card.goal) : null,
          ]),
          h(Badge, { key: 'b', active: canWork }, t(statusKey)),
        ]),
        h('div', { key: 'stats', className: 'dshmb_workStats' }, [
          `${t('steps')} ${card.steps.length}`,
          `${t('decisions')} ${card.decisions.length}`,
          `${t('artifacts')} ${card.artifacts.length}`,
          card.wakeWords?.length ? `${t('wakeWords')} ${card.wakeWords.join('、')}` : null,
        ].filter(Boolean).map((text, index) => h('span', { key: index }, text))),
        canWork ? h('div', { key: 'actions', className: 'dshmb_workActions' }, [
          h('input', {
            key: 'n',
            className: 'dshmb_input',
            value: note,
            placeholder: t('notePlaceholder'),
            onChange: (event) => setNote(event.target.value),
          }),
          h('button', {
            key: 's',
            type: 'button',
            className: 'dshmb_btn',
            disabled: busy || !note.trim(),
            onClick: () => { onUpdate(card.id, note, 'step'); setNote(''); },
          }, t('addStep')),
          h('button', {
            key: 'd',
            type: 'button',
            className: 'dshmb_btn',
            disabled: busy || !note.trim(),
            onClick: () => { onUpdate(card.id, note, 'decision'); setNote(''); },
          }, t('addDecision')),
        ]) : null,
        canWork ? h('div', { key: 'finishWrap' }, [
          h('div', { key: 'finish', className: 'dshmb_workFinish' }, [
            h('input', {
              key: 'o',
              className: 'dshmb_input',
              value: outcome,
              placeholder: t('outcomePlaceholder'),
              onChange: (event) => setOutcome(event.target.value),
            }),
            h('button', {
              key: 'f',
              type: 'button',
              className: 'dshmb_btn dshmb_btnDanger',
              disabled: busy,
              onClick: () => { onFinish(card.id, outcome); setOutcome(''); },
            }, t('finishWork')),
          ]),
          h('div', { key: 'hint', className: 'dshmb_hint' }, t('finishHint')),
        ]) : null,
        isDone ? h('div', { key: 'done', className: 'dshmb_workFinish' }, [
          h('div', { key: 'cool', className: 'dshmb_note' }, cooling
            ? t('archiveCooling', { time: fmtTime(card.coolingUntil) })
            : t('statusDone')),
          h('button', {
            key: 'a',
            type: 'button',
            className: 'dshmb_btn',
            disabled: busy || Boolean(cooling),
            title: cooling ? t('archiveCooling', { time: fmtTime(card.coolingUntil) }) : t('archiveWork'),
            onClick: () => onArchive(card.id),
          }, t('archiveWork')),
        ]) : null,
        card.outcome ? h('div', { key: 'out', className: 'dshmb_note', style: { marginTop: 7 } }, card.outcome) : null,
        (card.steps.length || card.decisions.length || card.artifacts.length) ? h('div', { key: 'entries', className: 'dshmb_entries' }, [
          ...card.steps.slice(-4).map((entry, index) => h('div', { key: `s${index}`, className: 'dshmb_entry' }, [h('b', { key: 'k' }, t('steps')), h('span', { key: 'v' }, entry.text)])),
          ...card.decisions.slice(-3).map((entry, index) => h('div', { key: `d${index}`, className: 'dshmb_entry' }, [h('b', { key: 'k' }, t('decisions')), h('span', { key: 'v' }, entry.text)])),
          ...card.artifacts.slice(-3).map((entry, index) => h('div', { key: `a${index}`, className: 'dshmb_entry' }, [h('b', { key: 'k' }, t('artifacts')), h('span', { key: 'v' }, entry.text)])),
        ]) : null,
      ]);
    }

    function Work({ data, t, busy, onStart, onUpdate, onFinish, onArchive }) {
      const [title, setTitle] = useState('');
      const [goal, setGoal] = useState('');
      const active = data.work.filter((card) => card.effectiveStatus === 'active' || card.effectiveStatus === 'stagnated');
      const done = data.work.filter((card) => card.effectiveStatus === 'done');
      const archived = data.work.filter((card) => card.effectiveStatus === 'archived');
      return h('div', null, [
        h('div', { key: 'form', className: 'dshmb_workForm' }, [
          h('input', {
            key: 't',
            className: 'dshmb_input',
            value: title,
            placeholder: t('newWorkTitle'),
            onChange: (event) => setTitle(event.target.value),
          }),
          h('input', {
            key: 'g',
            className: 'dshmb_input',
            value: goal,
            placeholder: t('newWorkGoal'),
            onChange: (event) => setGoal(event.target.value),
          }),
          h('button', {
            key: 'b',
            type: 'button',
            className: 'dshmb_btn dshmb_btnPrimary',
            disabled: busy || !title.trim(),
            onClick: () => { onStart(title, goal); setTitle(''); setGoal(''); },
          }, t('startWork')),
        ]),
        h('div', { key: 'list', className: 'dshmb_workList' }, (active.length || done.length || archived.length) ? [
          ...active.map((card) => h(WorkCard, { key: card.id, card, t, busy, onUpdate, onFinish, onArchive })),
          ...done.map((card) => h(WorkCard, { key: card.id, card, t, busy, onUpdate, onFinish, onArchive })),
          ...archived.map((card) => h(WorkCard, { key: card.id, card, t, busy, onUpdate, onFinish, onArchive })),
        ] : h(Empty, null, t('noWork'))),
        h('div', { key: 'hint', className: 'dshmb_hint' }, `${t('activeCount', { count: active.length })} · ${t('statusDone')} ${done.length} · ${t('workArchived')} ${archived.length}`),
      ]);
    }

    function TopicDetail({ topicKey, scope, t, onEdit }) {
      const [state, setState] = useState({ loading: true, topic: null, error: '' });
      useEffect(() => {
        let cancelled = false;
        setState({ loading: true, topic: null, error: '' });
        api(`/topic?key=${encodeURIComponent(topicKey)}&scope=${encodeURIComponent(scope)}`)
          .then((payload) => {
            if (!cancelled) setState({ loading: false, topic: payload.topic, error: '' });
          })
          .catch((error) => {
            if (!cancelled) setState({ loading: false, topic: null, error: error.message });
          });
        return () => { cancelled = true; };
      }, [topicKey, scope]);
      if (state.loading) return h('div', { className: 'dshmb_loading' }, t('loadingDetail'));
      if (state.error) return h(DetailError, { error: state.error, t });
      const topic = state.topic;
      return h('div', { className: 'dshmb_detail' }, [
        h('div', { key: 'h', className: 'dshmb_detailHead' }, [
          h('h3', { key: 't', className: 'dshmb_detailTitle' }, topic.title || topic.key),
          h('button', {
            key: 'e',
            type: 'button',
            className: 'dshmb_btn',
            disabled: typeof topic.revision !== 'string' || !topic.revision,
            title: typeof topic.revision === 'string' && topic.revision ? t('editTopic') : t('needService'),
            onClick: () => onEdit(topic),
          }, t('edit')),
        ]),
        h('div', { key: 'm', className: 'dshmb_meta' }, [
          h('span', { key: 'u', className: 'dshmb_metaKey' }, t('updated')),
          h('span', { key: 'uv', className: 'dshmb_metaVal' }, fmtTime(topic.updated)),
          h('span', { key: 'f', className: 'dshmb_metaKey' }, t('file')),
          h('span', { key: 'fv', className: 'dshmb_metaVal' }, topic.file || '—'),
          h('span', { key: 'c', className: 'dshmb_metaKey' }, t('chars')),
          h('span', { key: 'cv', className: 'dshmb_metaVal' }, String(topic.chars)),
        ]),
        h('pre', { key: 'b', className: 'dshmb_pre' }, topic.body || ''),
        h('div', { key: 'hint', className: 'dshmb_hint' }, t('topicReadOnly')),
      ]);
    }

    function Topics({ data, t, scope, onEditTopic }) {
      const [selected, setSelected] = useState(null);
      const topics = data.layers.L3.topics;
      return h('div', { className: 'dshmb_split' }, [
        h('section', { key: 'list', className: 'dshmb_panel' }, [
          h('div', { className: 'dshmb_panelHead' }, [
            h('span', { key: 't', className: 'dshmb_panelTitle' }, t('tabTopics')),
            h(Badge, { key: 'b' }, String(topics.length)),
          ]),
          h('div', { key: 'rows', className: 'dshmb_scroll' }, topics.length ? topics.map((topic) => h('button', {
            key: topic.key,
            type: 'button',
            className: `dshmb_row${selected === topic.key ? ' is-selected' : ''}`,
            onClick: () => setSelected(topic.key),
          }, [
            h('div', { key: 'm', className: 'dshmb_rowMain' }, [
              h('div', { key: 't', className: 'dshmb_rowTitle' }, topic.title || topic.key),
              h('div', { key: 's', className: 'dshmb_rowSub' }, topic.summary || topic.key),
            ]),
            h('div', { key: 'b', className: 'dshmb_badges' }, h(Badge, { key: 'c' }, `${topic.chars} ${t('chars')}`)),
          ])) : h(Empty, null, t('noTopics'))),
        ]),
        h('section', { key: 'detail', className: 'dshmb_panel' }, selected
          ? h(TopicDetail, { topicKey: selected, scope, t, onEdit: onEditTopic })
          : h(Empty, null, t('topicHint'))),
      ]);
    }

    function Features({ data, t, busy, onToggle }) {
      return h('section', { className: 'dshmb_panel' }, [
        h('div', { key: 'head', className: 'dshmb_panelHead' }, [
          h('span', { key: 't', className: 'dshmb_panelTitle' }, t('tabFeatures')),
          h(Badge, { key: 'b' }, `${Object.values(data.features).filter(Boolean).length}/18`),
        ]),
        h('div', { key: 'body', style: { padding: '4px 14px 12px' } }, [
          ...FEATURE_GROUPS.map((group) => h('div', { key: group.key, className: 'dshmb_featureGroup' }, [
            h('div', { key: 'g', className: 'dshmb_featureGroupTitle' }, t(group.key)),
            ...group.keys.map((key) => {
              const on = data.features[key] === true;
              const implemented = key === 'features.prompt_section';
              return h('div', { key, className: 'dshmb_feature' }, [
                h('div', { key: 'l', style: { minWidth: 0 } }, [
                  h('div', { key: 'n', className: 'dshmb_featureName' }, t(featureLabelKey(key))),
                  h('div', { key: 'k', className: 'dshmb_featureKey' }, `${key} · ${on ? t('on') : t('off')}`),
                ]),
                h('div', { key: 'r', style: { display: 'flex', alignItems: 'center', gap: 8 } }, [
                  h('span', { key: 's', className: 'dshmb_featureState' }, implemented ? t('featureImplemented') : t('featureIntent')),
                  h('button', {
                    key: 'switch',
                    type: 'button',
                    role: 'switch',
                    'aria-checked': on,
                    'aria-label': key,
                    className: `dshmb_switch${on ? ' is-on' : ''}`,
                    disabled: busy,
                    onClick: () => onToggle(key, !on),
                  }, h('span', { key: 'k', className: 'dshmb_knob' })),
                ]),
              ]);
            }),
          ])),
          h('div', { key: 'hint', className: 'dshmb_hint' }, t('featureHint')),
        ]),
      ]);
    }

    function Timeline({ scope, t }) {
      const [state, setState] = useState({
        loading: true, items: [], hasMore: false, total: 0, scanLimited: false, skippedCorrupted: 0, error: '',
      });
      const [loadingMore, setLoadingMore] = useState(false);
      const [sourceFilter, setSourceFilter] = useState('all');
      const [actionFilter, setActionFilter] = useState('all');

      const load = useCallback(async (offset, append) => {
        if (append) setLoadingMore(true);
        else setState((previous) => ({ ...previous, loading: true, error: '' }));
        try {
          const payload = await api(`/timeline?scope=${encodeURIComponent(scope)}&offset=${offset}&limit=50`);
          const data = payload.data;
          setState((previous) => ({
            loading: false,
            items: append ? [...previous.items, ...data.items] : data.items,
            hasMore: data.hasMore,
            total: data.total,
            scanLimited: data.scanLimited,
            skippedCorrupted: data.skippedCorrupted,
            error: '',
          }));
        } catch (error) {
          setState((previous) => ({ ...previous, loading: false, error: error.message }));
        } finally {
          if (append) setLoadingMore(false);
        }
      }, [scope]);

      useEffect(() => { load(0, false); }, [load]);

      if (state.loading) return h('div', { className: 'dshmb_loading' }, t('loadingDetail'));

      const actions = [...new Set(state.items.map((item) => item.action).filter(Boolean))].sort();
      const visible = state.items.filter((item) => {
        const sources = item.sources || [item.source];
        const sourceOk = sourceFilter === 'all' || sources.includes(sourceFilter);
        const actionOk = actionFilter === 'all' || item.action === actionFilter;
        return sourceOk && actionOk;
      });
      const groups = new Map();
      for (const item of visible) {
        const day = String(item.at || '').slice(0, 10) || '—';
        if (!groups.has(day)) groups.set(day, []);
        groups.get(day).push(item);
      }

      return h('section', { className: 'dshmb_panel' }, [
        h('div', { key: 'head', className: 'dshmb_panelHead' }, [
          h('span', { key: 't', className: 'dshmb_panelTitle' }, t('tabTimeline')),
          h(Badge, { key: 'b' }, String(state.total)),
        ]),
        h('div', { key: 'body', style: { padding: '4px 14px 12px' } }, [
          h('div', { key: 'hint', className: 'dshmb_hint' }, t('timelineHint')),
          state.scanLimited ? h('div', { key: 'scan', className: 'dshmb_note dshmb_warn' }, t('timelineScanLimited')) : null,
          state.skippedCorrupted > 0 ? h('div', { key: 'bad', className: 'dshmb_note dshmb_warn' }, t('timelineCorrupted', { count: state.skippedCorrupted })) : null,
          state.error ? h('div', { key: 'err', className: 'dshmb_banner' }, state.error) : null,
          h('div', { key: 'filters', className: 'dshmb_timelineFilters' }, [
            h('div', { key: 'src', className: 'dshmb_filters', style: { padding: 0 } }, [
              ['all', t('timelineFilterAll')],
              ['journal', t('timelineFilterJournal')],
              ['spark', t('timelineFilterSpark')],
            ].map(([value, label]) => h('button', {
              key: value,
              type: 'button',
              className: `dshmb_filter${sourceFilter === value ? ' is-active' : ''}`,
              onClick: () => setSourceFilter(value),
            }, label))),
            h('select', {
              key: 'act',
              className: 'dshmb_select',
              value: actionFilter,
              onChange: (event) => setActionFilter(event.target.value),
              'aria-label': t('timelineActionAll'),
            }, [
              h('option', { key: 'all', value: 'all' }, t('timelineActionAll')),
              ...actions.map((action) => h('option', { key: action, value: action }, action)),
            ]),
          ]),
          visible.length ? h('div', { key: 'rows', className: 'dshmb_timeline' }, [...groups.entries()].map(([day, items]) => h('div', {
            key: `day-${day}`,
            className: 'dshmb_timelineDay',
          }, [
            h('div', { key: 'd', className: 'dshmb_timelineDayTitle' }, day),
            ...items.map((item, index) => h('div', {
              key: `${item.operationId ?? 'op'}-${index}`,
              className: 'dshmb_timelineRow',
            }, [
              h('div', { key: 'time', className: 'dshmb_timelineTime' }, fmtTime(item.at).slice(11)),
              h('div', { key: 'body', className: 'dshmb_timelineBody' }, [
                h('div', { key: 'top', className: 'dshmb_timelineTop' }, [
                  ...(item.sources || [item.source]).map((source) => h(Badge, {
                    key: source,
                    active: source === 'spark',
                  }, source === 'spark' ? t('timelineSpark') : t('timelineJournal'))),
                  h('b', { key: 'title' }, item.target?.title || item.target?.id || '—'),
                ]),
                h('div', { key: 'meta', className: 'dshmb_note' }, `${item.action} · ${item.target?.type || '—'} · ${item.operationId?.slice(0, 8) || '—'}`),
              ]),
            ])),
          ]))) : h(Empty, null, t('timelineEmpty')),
          state.hasMore ? h('div', { key: 'more', style: { marginTop: 10, textAlign: 'center' } }, h('button', {
            type: 'button',
            className: 'dshmb_btn',
            disabled: loadingMore,
            onClick: () => load(state.items.length, true),
          }, loadingMore ? t('loading') : t('timelineLoadMore'))) : null,
        ]),
      ]);
    }

    function Depth({ scope, t, features }) {
      const [state, setState] = useState({ loading: true, data: null, error: '' });
      const [nonce, setNonce] = useState(0);
      const [busy, setBusy] = useState(false);
      const [message, setMessage] = useState('');
      const [form, setForm] = useState({ id: '', name: '', ttlDays: 7, maxEntries: 60 });
      const [drafts, setDrafts] = useState({});
      const customEnabled = features?.['features.custom_areas'] === true;
      useEffect(() => {
        let live = true;
        api(`/depth?scope=${encodeURIComponent(scope)}`)
          .then((payload) => { if (live) setState({ loading: false, data: payload.depth, error: '' }); })
          .catch((error) => { if (live) setState({ loading: false, data: null, error: error.message }); });
        return () => { live = false; };
      }, [scope, nonce]);
      if (state.loading) return h('div', { className: 'dshmb_loading' }, t('loadingDetail'));
      if (state.error) return h(DetailError, { error: state.error, t });
      const data = state.data;
      const status = data.status;
      const areas = data.customAreas ?? [];
      async function createArea() {
        setBusy(true);
        setMessage('');
        try {
          await api('/area/create', {
            method: 'POST',
            body: JSON.stringify({
              id: form.id,
              name: form.name,
              ttlDays: Number(form.ttlDays) || 7,
              maxEntries: Number(form.maxEntries) || 60,
            }),
          });
          setForm({ id: '', name: '', ttlDays: 7, maxEntries: 60 });
          setMessage(t('customCreated'));
          setNonce((value) => value + 1);
        } catch (error) {
          setMessage(error.message);
        } finally {
          setBusy(false);
        }
      }
      async function feedArea(area) {
        const text = String(drafts[area.id] ?? '').trim();
        if (!text) return;
        setBusy(true);
        setMessage('');
        try {
          await api('/area/feed', { method: 'POST', body: JSON.stringify({ id: area.id, text }) });
          setDrafts((current) => ({ ...current, [area.id]: '' }));
          setMessage(t('customSaved'));
          setNonce((value) => value + 1);
        } catch (error) {
          setMessage(error.message);
        } finally {
          setBusy(false);
        }
      }
      return h('section', { className: 'dshmb_panel' }, [
        h('div', { key: 'head', className: 'dshmb_panelHead' }, [
          h('span', { key: 't', className: 'dshmb_panelTitle' }, t('depthTitle')),
          h(Badge, { key: 'b' }, `${status.hippo1 + status.hippo2 + status.context} 条`),
        ]),
        h('div', { key: 'body', style: { padding: '4px 14px 12px' } }, [
          h('div', { key: 'hint', className: 'dshmb_hint' }, t('depthHint')),
          h('div', { key: 'grid', className: 'dshmb_depthGrid' }, [
            h('div', { key: 'hippo', className: 'dshmb_depthCard' }, [
              h('b', { key: 't' }, t('depthHippo')),
              h('div', { key: 'v', className: 'dshmb_note' }, `1.0 ${status.hippo1} · 2.0 ${status.hippo2} · ${t('depthContext')} ${status.context}`),
            ]),
            h('div', { key: 'health', className: 'dshmb_depthCard' }, [
              h('b', { key: 't' }, t('depthHealth')),
              h('div', { key: 'v', className: 'dshmb_note' }, `${data.health?.score ?? '—'}/100${data.health?.issues?.length ? ` · ${data.health.issues[0]}` : ''}`),
            ]),
            h('div', { key: 'queue', className: 'dshmb_depthCard' }, [
              h('b', { key: 't' }, t('depthQueue')),
              h('div', { key: 'v', className: 'dshmb_note' }, `${status.queue} 条`),
            ]),
            h('div', { key: 'focus', className: 'dshmb_depthCard' }, [
              h('b', { key: 't' }, t('depthFocus')),
              h('div', { key: 'v', className: 'dshmb_note' }, data.focus?.text || t('depthEmpty')),
            ]),
            h('div', { key: 'custom', className: 'dshmb_depthCard' }, [
              h('b', { key: 't' }, t('depthCustom')),
              h('div', { key: 'v', className: 'dshmb_note' }, areas.length
                ? areas.map((area) => `${area.name}：${area.entries.length} 条`).join('；')
                : t('depthEmpty')),
            ]),
            h('div', { key: 'verify', className: 'dshmb_depthCard' }, [
              h('b', { key: 't' }, t('depthVerify')),
              h('div', { key: 'v', className: 'dshmb_note' }, `${status.verifyPending} 条`),
            ]),
            h('div', { key: 'affect', className: 'dshmb_depthCard' }, [
              h('b', { key: 't' }, t('depthAffect')),
              h('div', { key: 'v', className: 'dshmb_note' }, Object.keys(data.affect?.targets ?? {}).length
                ? Object.entries(data.affect.targets).map(([name, bucket]) => `${name}：${bucket.attitude || '未形成'}`).join('；')
                : t('depthEmpty')),
            ]),
          ]),
          h('div', { key: 'customSection', style: { marginTop: 14 } }, [
            h('b', { key: 't' }, t('depthCustom')),
            !customEnabled
              ? h('div', { key: 'off', className: 'dshmb_hint' }, t('customNeedFeature'))
              : h('div', { key: 'on' }, [
                  h('div', { key: 'form', className: 'dshmb_areaForm' }, [
                    h('input', {
                      key: 'id',
                      className: 'dshmb_input',
                      placeholder: t('customId'),
                      value: form.id,
                      onChange: (event) => setForm((current) => ({ ...current, id: event.target.value })),
                    }),
                    h('input', {
                      key: 'name',
                      className: 'dshmb_input',
                      placeholder: t('customName'),
                      value: form.name,
                      onChange: (event) => setForm((current) => ({ ...current, name: event.target.value })),
                    }),
                    h('input', {
                      key: 'ttl',
                      className: 'dshmb_input',
                      type: 'number',
                      min: 0,
                      placeholder: t('customTtl'),
                      value: form.ttlDays,
                      onChange: (event) => setForm((current) => ({ ...current, ttlDays: event.target.value })),
                    }),
                    h('input', {
                      key: 'max',
                      className: 'dshmb_input',
                      type: 'number',
                      min: 1,
                      placeholder: t('customMax'),
                      value: form.maxEntries,
                      onChange: (event) => setForm((current) => ({ ...current, maxEntries: event.target.value })),
                    }),
                    h('button', {
                      key: 'create',
                      type: 'button',
                      className: 'dshmb_btn dshmb_btnPrimary',
                      disabled: busy || !form.id.trim(),
                      onClick: createArea,
                    }, t('customCreateBtn')),
                  ]),
                  message ? h('div', { key: 'msg', className: 'dshmb_note' }, message) : null,
                  areas.length
                    ? areas.map((area) => h('div', { key: area.id, className: 'dshmb_areaItem' }, [
                        h('div', { key: 'h', className: 'dshmb_areaHead' }, `${area.name} · ${area.id} · ${area.entries.length} 条`),
                        ...(area.entries.slice(0, 3).map((entry) => h('div', { key: entry.id, className: 'dshmb_note' }, `- ${entry.text}`))),
                        h('textarea', {
                          key: 'input',
                          className: 'dshmb_areaText',
                          rows: 2,
                          placeholder: t('customFeed'),
                          value: drafts[area.id] ?? '',
                          onChange: (event) => setDrafts((current) => ({ ...current, [area.id]: event.target.value })),
                        }),
                        h('div', { key: 'actions', style: { display: 'flex', gap: 8, marginTop: 6 } }, [
                          h('button', {
                            key: 'save',
                            type: 'button',
                            className: 'dshmb_btn dshmb_btnPrimary',
                            disabled: busy || !String(drafts[area.id] ?? '').trim(),
                            onClick: () => feedArea(area),
                          }, t('customSave')),
                          h('button', {
                            key: 'clear',
                            type: 'button',
                            className: 'dshmb_btn',
                            onClick: () => setDrafts((current) => ({ ...current, [area.id]: '' })),
                          }, t('customClear')),
                        ]),
                      ]))
                    : h('div', { key: 'empty', className: 'dshmb_note' }, t('customEmpty')),
                ]),
          ]),
          h('div', { key: 'ctx', style: { marginTop: 12 } }, [
            h('b', { key: 't' }, t('depthContext')),
            ...(data.context.length
              ? data.context.map((item) => h('div', { key: item.id, className: 'dshmb_note' }, `- ${item.text}`))
              : [h('div', { key: 'e', className: 'dshmb_note' }, t('depthEmpty'))]),
          ]),
          h('div', { key: 'dream', style: { marginTop: 12 } }, [
            h('b', { key: 't' }, t('depthDream')),
            ...(data.dream.length
              ? data.dream.map((item) => h('div', { key: item.id, className: 'dshmb_note' }, `- ${item.text}`))
              : [h('div', { key: 'e', className: 'dshmb_note' }, t('depthEmpty'))]),
          ]),
        ]),
      ]);
    }

    function Setup({ t }) {
      const [state, setState] = useState({ loading: true, data: null, error: '', copied: false });
      useEffect(() => {
        let live = true;
        api('/setup')
          .then((payload) => { if (live) setState((current) => ({ ...current, loading: false, data: payload.setup, error: '' })); })
          .catch((error) => { if (live) setState((current) => ({ ...current, loading: false, error: error.message })); });
        return () => { live = false; };
      }, []);
      if (state.loading) return h('div', { className: 'dshmb_loading' }, t('loadingDetail'));
      if (state.error) return h(DetailError, { error: state.error, t });
      const data = state.data;
      return h('section', { className: 'dshmb_panel' }, [
        h('div', { key: 'head', className: 'dshmb_panelHead' }, [
          h('span', { key: 't', className: 'dshmb_panelTitle' }, t('setupTitle')),
        ]),
        h('div', { key: 'body', style: { padding: '4px 14px 12px' } }, [
          h('div', { key: 'hint', className: 'dshmb_hint' }, t('setupHint')),
          ...data.checks.map((check) => h('div', { key: check.name, className: 'dshmb_feature' }, [
            h('div', { key: 'l' }, [
              h('div', { key: 'n', className: 'dshmb_featureName' }, check.name),
              h('div', { key: 'd', className: 'dshmb_featureKey' }, check.detail),
            ]),
            h('span', { key: 's', className: check.ok ? 'dshmb_ok' : check.optional ? 'dshmb_optional' : 'dshmb_bad' }, check.ok ? t('setupOk') : check.optional ? t('setupOptional') : t('setupFail')),
          ])),
          data.warnings.length ? h('div', { key: 'w', className: 'dshmb_banner' }, data.warnings.join('；')) : null,
          h('div', { key: 'snippetHead', style: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 14 } }, [
            h('b', { key: 't' }, 'cordis.patch.yml'),
            h('button', {
              key: 'c',
              type: 'button',
              className: 'dshmb_btn',
              onClick: async () => {
                try {
                  await navigator.clipboard.writeText(data.snippet);
                  setState((current) => ({ ...current, copied: true }));
                } catch {
                  /* clipboard may be unavailable */
                }
              },
            }, state.copied ? t('setupCopied') : t('setupCopy')),
          ]),
          h('pre', { key: 'snippet', className: 'dshmb_diff' }, data.snippet),
        ]),
      ]);
    }

    function Archive({ data, t }) {
      const cards = data.archive || [];
      return h('section', { className: 'dshmb_panel' }, [
        h('div', { key: 'head', className: 'dshmb_panelHead' }, [
          h('span', { key: 't', className: 'dshmb_panelTitle' }, t('tabArchive')),
          h(Badge, { key: 'b' }, t('archiveCount', { count: cards.length })),
        ]),
        h('div', { key: 'body', style: { padding: '4px 14px 12px' } }, cards.length ? cards.map((card) => h('div', { key: card.id, className: 'dshmb_archiveRow' }, [
          h('div', { key: 'l', style: { minWidth: 0 } }, [
            h('div', { key: 't', className: 'dshmb_rowTitle' }, card.title || card.id),
            h('div', { key: 's', className: 'dshmb_rowSub' }, card.summary || ''),
            (card.wakeWords || []).length ? h('div', { key: 'w', className: 'dshmb_chips' }, card.wakeWords.map((word, index) => h('span', { key: index, className: 'dshmb_chip' }, word))) : null,
          ]),
          h('div', { key: 'r', style: { textAlign: 'right', flexShrink: 0 } }, [
            h('div', { key: 'd', className: 'dshmb_note' }, `${t('archivedAt')} ${fmtTime(card.archivedAt)}`),
            h('div', { key: 'i', className: 'dshmb_note' }, card.id),
          ]),
        ])) : h(Empty, null, t('noArchive'))),
      ]);
    }

    function Panel({ ctx }) {
      useLocaleSnapshot(ctx);
      const t = ctx.locale.bind(NS);
      const [tab, setTab] = useState('overview');
      const [data, setData] = useState(null);
      const [scope, setScope] = useState('');
      const [loading, setLoading] = useState(true);
      const [busy, setBusy] = useState(false);
      const [error, setError] = useState('');
      const [toast, setToast] = useState('');
      const [editor, setEditor] = useState(null);
      const loadSeq = React.useRef(0);

      const load = useCallback(async (quiet = false) => {
        const seq = ++loadSeq.current;
        if (!quiet) setLoading(true);
        try {
          const query = scope ? `?scope=${encodeURIComponent(scope)}` : '';
          const payload = await api(`/overview${query}`);
          if (seq !== loadSeq.current) return;
          setData(payload.data);
          setScope((current) => current || payload.data.scope);
          setError('');
        } catch (loadError) {
          if (seq === loadSeq.current) setError(loadError.message);
        } finally {
          if (seq === loadSeq.current && !quiet) setLoading(false);
        }
      }, [scope]);

      useEffect(() => { load(); }, [load]);
      useEffect(() => {
        const onFocus = () => load(true);
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
      }, [load]);
      useEffect(() => {
        if (!toast) return undefined;
        const timer = window.setTimeout(() => setToast(''), 2600);
        return () => window.clearTimeout(timer);
      }, [toast]);

      async function mutate(path, body, message) {
        setBusy(true);
        setError('');
        try {
          await api(path, { method: 'POST', body: JSON.stringify(body) });
          setToast(message);
          await load(true);
        } catch (mutateError) {
          setError(mutateError.message);
        } finally {
          setBusy(false);
        }
      }

      async function openCoreEditor() {
        try {
          const payload = await api(`/core?scope=${encodeURIComponent(data.scope)}`);
          const core = payload.core;
          if (!core?.revision) throw new Error(t('needService'));
          setEditor({
            kind: 'core',
            title: t('editCore'),
            initialBody: core.body ?? core.text ?? '',
            fields: {},
            fieldDefs: {},
            revision: core.revision,
            scope: data.scope,
            error: '',
          });
        } catch (loadError) {
          setError(loadError.message);
        }
      }

      function openTopicEditor(topic) {
        if (!topic?.revision) {
          setError(t('needService'));
          return;
        }
        setEditor({
          kind: 'topic',
          title: t('editTopic'),
          key: topic.key,
          initialBody: topic.body ?? '',
          fields: { title: topic.title ?? topic.key, summary: topic.summary ?? '' },
          fieldDefs: { title: t('topicTitle'), summary: t('topicSummary') },
          revision: topic.revision,
          scope: data.scope,
          error: '',
        });
      }

      async function openPersonaEditor() {
        try {
          const payload = await api(`/persona?scope=${encodeURIComponent(data.scope)}`);
          const persona = payload.persona;
          if (!persona?.revision) throw new Error(t('needService'));
          setEditor({
            kind: 'persona',
            title: t('editPersona'),
            initialBody: persona.body ?? persona.text ?? '',
            fields: {},
            fieldDefs: {},
            revision: persona.revision,
            scope: data.scope,
            error: '',
          });
        } catch (loadError) {
          setError(loadError.message);
        }
      }

      function openSparkEditor(card) {
        if (!card || !Number.isInteger(card.revision)) {
          setError(t('needService'));
          return;
        }
        setEditor({
          kind: 'spark',
          title: t('edit'),
          id: card.id,
          initialBody: card.content ?? '',
          fields: {
            title: card.title ?? '',
            summary: card.summary ?? '',
            triggers: (card.triggers ?? []).join(', '),
            entities: (card.entities ?? []).join(', '),
          },
          fieldDefs: {
            title: t('topicTitle'),
            summary: t('topicSummary'),
            triggers: t('triggers'),
            entities: t('entities'),
          },
          revision: card.revision,
          scope: data.scope,
          error: '',
        });
      }

      async function saveEditor({ body, fields }) {
        if (!editor) return;
        setBusy(true);
        setEditor((current) => (current ? { ...current, error: '' } : current));
        try {
          const operationId = globalThis.crypto?.randomUUID
            ? globalThis.crypto.randomUUID()
            : `op-${Date.now()}-${Math.random().toString(36).slice(2)}`;
          let change;
          if (editor.kind === 'core') {
            change = { kind: 'core', text: body, expectedRevision: editor.revision };
          } else if (editor.kind === 'persona') {
            change = { kind: 'persona', text: body, expectedRevision: editor.revision };
          } else if (editor.kind === 'spark') {
            change = {
              kind: 'spark',
              id: editor.id,
              expectedRevision: editor.revision,
              patch: {
                title: fields.title || '',
                summary: fields.summary || '',
                content: body,
                triggers: String(fields.triggers || '').split(',').map((item) => item.trim()).filter(Boolean),
                entities: String(fields.entities || '').split(',').map((item) => item.trim()).filter(Boolean),
              },
            };
          } else {
            change = {
              kind: 'topic',
              key: editor.key,
              text: body,
              expectedRevision: editor.revision,
              topic: {
                title: fields.title || editor.key,
                summary: fields.summary || '',
                updated: new Date().toISOString(),
              },
            };
          }
          const result = await api('/commit', {
            method: 'POST',
            body: JSON.stringify({ scope: editor.scope, operationId, changes: [change] }),
          });
          setEditor(null);
          setToast(result.backup
            ? `${t('savedToast')} ${t('backupAt', { path: shortPath(result.backup) })}`
            : t('savedToast'));
          await load(true);
        } catch (saveError) {
          const conflict = saveError.code === 'REVISION_CONFLICT';
          setEditor((current) => (current ? {
            ...current,
            error: conflict ? t('conflictReload') : t('saveFailed', { error: saveError.message }),
          } : current));
          if (conflict) await load(true);
        } finally {
          setBusy(false);
        }
      }

      if (loading && !data) return h('div', { className: 'dshmb_root' }, h('div', { className: 'dshmb_loading' }, t('loading')));

      if (!data) {
        return h('div', { className: 'dshmb_root' }, [
          h('div', { key: 'h', className: 'dshmb_header' }, [
            h('div', { key: 'l' }, [h('h1', { key: 't', className: 'dshmb_title' }, t('title'))]),
            h('button', { key: 'r', type: 'button', className: 'dshmb_btn', onClick: () => load() }, t('retry')),
          ]),
          h('div', { key: 'e', className: 'dshmb_banner' }, [h('span', { key: 'm' }, `${t('error')}：${error}`)]),
        ]);
      }

      const tabs = [
        ['overview', t('tabOverview')],
        ['sparks', t('tabSparks')],
        ['work', t('tabWork')],
        ['topics', t('tabTopics')],
        ['timeline', t('tabTimeline')],
        ['depth', t('tabDepth')],
        ['features', t('tabFeatures')],
        ['setup', t('tabSetup')],
        ['archive', t('tabArchive')],
      ];
      const activeCount = data.sparks.active.length;
      const activeWork = data.work.filter((card) => card.effectiveStatus === 'active' || card.effectiveStatus === 'stagnated').length;
      const featureCount = Object.values(data.features).filter(Boolean).length;

      return h('div', { className: 'dshmb_root' }, [
        h('header', { key: 'h', className: 'dshmb_header' }, [
          h('div', { key: 'l', style: { minWidth: 0 } }, [
            h('h1', { key: 't', className: 'dshmb_title' }, t('title')),
            h('p', { key: 's', className: 'dshmb_subtitle' }, t('subtitle')),
            h('div', { key: 'sc', className: 'dshmb_scope' }, [
              `${t('scope')}：${data.scope === 'global' ? t('scopeGlobal') : data.scope}`,
              h('span', { key: 'g', className: 'dshmb_pill' }, fmtTime(data.generatedAt)),
            ]),
          ]),
          h('div', { key: 'r', className: 'dshmb_actions' }, [
            h('select', {
              key: 'scope',
              className: 'dshmb_select',
              value: scope || data.scope,
              title: t('scope'),
              onChange: (event) => setScope(event.target.value),
            }, data.scopes.map((item) => h('option', { key: item, value: item }, item === 'global' ? t('scopeGlobal') : item))),
            h('span', { key: 'svc', className: 'dshmb_pill' }, data.service?.available
              ? t('serviceConnected', { version: data.service.version })
              : t('serviceFallback')),
            h('span', { key: 'p', className: 'dshmb_pill', title: data.dataRoot }, shortPath(data.dataRoot)),
            h('button', {
              key: 'b',
              type: 'button',
              className: 'dshmb_btn',
              disabled: busy || loading,
              onClick: () => load(),
            }, t('refresh')),
          ]),
        ]),
        error ? h('div', { key: 'e', className: 'dshmb_banner' }, [
          h('span', { key: 'm' }, `${t('error')}：${error}`),
          h('button', { key: 'r', type: 'button', className: 'dshmb_btn', onClick: () => load() }, t('retry')),
        ]) : null,
        toast ? h('div', { key: 'toast', className: 'dshmb_toast' }, toast) : null,
        h('div', { key: 'k', className: 'dshmb_kpis' }, [
          ['kpiActiveSparks', activeCount],
          ['kpiTopics', data.layers.L3.count],
          ['kpiActiveWork', activeWork],
          ['kpiFeatures', `${featureCount}/18`],
        ].map(([key, value]) => h('div', { key, className: 'dshmb_kpi' }, [
          h('div', { key: 'v', className: 'dshmb_kpiValue' }, String(value)),
          h('div', { key: 'l', className: 'dshmb_kpiLabel' }, t(key)),
        ]))),
        h('nav', { key: 'tabs', className: 'dshmb_tabs' }, tabs.map(([key, label]) => h('button', {
          key,
          type: 'button',
          className: `dshmb_tab${tab === key ? ' is-active' : ''}`,
          onClick: () => setTab(key),
        }, label))),
        h('main', { key: 'body' }, [
          tab === 'overview' ? h(Overview, { key: 'o', data, t, onGoWork: () => setTab('work'), onEditCore: openCoreEditor, onEditPersona: openPersonaEditor }) : null,
          tab === 'sparks' ? h(Sparks, { key: `s-${data.scope}`, data, t, scope: data.scope, onEditSpark: openSparkEditor }) : null,
          tab === 'work' ? h(Work, {
            key: 'w',
            data,
            t,
            busy,
            onStart: (title, goal) => mutate('/work', { action: 'start', title, goal }, t('toastCreated')),
            onUpdate: (id, note, kind) => mutate('/work', { action: 'update', id, note, kind }, t('toastUpdated')),
            onFinish: (id, outcome) => mutate('/work', { action: 'finish', id, outcome }, t('toastFinished')),
            onArchive: (id) => mutate('/work', { action: 'archive', id }, t('toastArchived')),
          }) : null,
          tab === 'topics' ? h(Topics, { key: `t-${data.scope}`, data, t, scope: data.scope, onEditTopic: openTopicEditor }) : null,
          tab === 'timeline' ? h(Timeline, { key: `tl-${data.scope}`, scope: data.scope, t }) : null,
          tab === 'depth' ? h(Depth, { key: `d-${data.scope}`, scope: data.scope, t, features: data.features }) : null,
          tab === 'setup' ? h(Setup, { key: 'setup', t }) : null,
          tab === 'features' ? h(Features, {
            key: 'f',
            data: { ...data, featureKeys: Object.keys(data.features) },
            t,
            busy,
            onToggle: (key, value) => mutate('/features', { key, value }, t('toastFeature')),
          }) : null,
          tab === 'archive' ? h(Archive, { key: 'a', data, t }) : null,
        ]),
        h('div', { key: 'foot', className: 'dshmb_hint' }, `${t('scope')}: ${data.scope} · ${t('tabFeatures')}: ${featureCount}/18`),
        editor ? h(EditorModal, {
          key: 'editor',
          t,
          editor,
          busy,
          onClose: () => setEditor(null),
          onSave: saveEditor,
        }) : null,
      ]);
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(() => {
          const disposeZh = ctx.locale.register(NS, 'zh', DICT.zh);
          const disposeEn = ctx.locale.register(NS, 'en', DICT.en);
          return () => {
            disposeEn();
            disposeZh();
          };
        }, 'shiori-companion: locale');

        ctx.effect(() => {
          const style = document.createElement('style');
          style.id = 'dshsc-style';
          style.textContent = CSS;
          document.head.appendChild(style);
          return () => style.remove();
        }, 'shiori-companion: styles');

        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist',
          id: 'shiori-companion',
          order: 8,
          label: () => ctx.locale.bind(NS)('navLabel'),
        }, (ownerProps) => h(BoardIcon, {
          size: ownerProps?.size ?? 18,
          active: ownerProps?.active === true,
        })));

        ctx.slots.inject('main', () => ctx.slots.register({
          name: 'main',
          key: 'shiori-companion',
        }, () => h(Panel, { ctx })));
      },
    };
  },
});
