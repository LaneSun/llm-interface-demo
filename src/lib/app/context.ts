import * as z from "zod";

type ClassToType<T> = {
  [K in keyof T as T[K] extends (...args: any[]) => any
    ? never
    : K extends keyof DefaultProps<T>
      ? K
      : never]?: T[K];
} & {
  [K in keyof T as T[K] extends (...args: any[]) => any
    ? never
    : K extends keyof DefaultProps<T>
      ? never
      : K]: T[K];
};

// 辅助类型：提取有默认值的属性
type DefaultProps<T> = {
  [K in keyof T as T[K] extends (...args: any[]) => any
    ? never
    : undefined extends T[K]
      ? never
      : K]: T[K];
};

export class ContextNode<T> {
  static schema = z.object({});
  with(params: ClassToType<T>) {
    Object.assign(this, params);
    return this;
  }
}

export class Root extends ContextNode<Root> {
  app_name = "Demo";
  app_describe = `\
该应用是一个用于信号采集、分析的软件，\
它可以从虚拟或实际采集硬件中采集信号，并调用内置的分析算法处理这些信号，\
然后使用内置的图形节点像用户呈现这些数据。
该应用使用AI来强化使用体验，用户可以通过和AI对话来指示AI完成所有以上功能。`;
  now_time = new Date().toLocaleString();
  current_conversation = new Conversation();
  available_views: ViewType[] = [
    new ViewType().with({
      name: "view",
      description: "视图的根元素，必须，内部有且仅有一个元素",
    }),
    new ViewType().with({
      name: "box",
      description: "仅容纳一个元素的布局容器，一般用于指定拓展",
      params: [
        new ViewParam().with({
          name: "grow",
          description: "控制容器是否在父容器中拓展",
          type: ["boolean"],
        }),
      ],
    }),
    new ViewType().with({
      name: "h-box",
      description: "使内部元素水平放置的布局容器",
      params: [
        new ViewParam().with({
          name: "grow",
          description: "控制容器是否在父容器中拓展",
          type: ["boolean"],
        }),
      ],
    }),
    new ViewType().with({
      name: "v-box",
      description: "使内部元素垂直放置的布局容器",
      params: [
        new ViewParam().with({
          name: "grow",
          description: "控制容器是否在父容器中拓展",
          type: ["boolean"],
        }),
      ],
    }),
    new ViewType().with({
      name: "grid",
      description: "使内部元素网格布局的布局容器",
      params: [
        new ViewParam().with({
          name: "line",
          description:
            '控制网格是否显示行间与列间分隔线，值为 "none" | "row" | "column" | "all" ',
          type: ["string"],
        }),
      ],
      argument_types: ["row"],
    }),
    new ViewType().with({
      name: "row",
      description: "指示grid布局内的单行",
      argument_types: ["cell"],
    }),
    new ViewType().with({
      name: "cell",
      description: "指示grid布局内一行的单个单元格",
    }),
    new ViewType().with({
      name: "separator",
      description: "分隔线，仅能在 v-box 或 h-box 中使用",
    }),
    new ViewType().with({
      name: "label",
      description: "显示文本的视图元素",
      argument_types: ["string"],
    }),
    new ViewType().with({
      name: "button",
      description: "可供用户点击以触发操作的按钮",
      params: [
        new ViewParam().with({
          name: "text",
          description: "显示在按钮上的文本",
          type: ["string"],
        }),
        new ViewParam().with({
          name: "click",
          description: "当按钮被点击时触发的函数，一般从 prepare 提供",
          type: ["function"],
        }),
      ],
    }),
    new ViewType().with({
      name: "switch",
      description: "可供用户点击以切换状态的开关",
      params: [
        new ViewParam().with({
          name: "label",
          description: "显示在开关上的名称标题",
          type: ["string"],
        }),
        new ViewParam().with({
          name: "value",
          type: ["boolean"],
        }),
      ],
    }),
    new ViewType().with({
      name: "select",
      description:
        "可供用户从多个选项中选择的选择框，当为单选时必须选择一个选项，当为多选时可以为空选择",
      params: [
        new ViewParam().with({
          name: "label",
          description: "显示在控件上的名称标题",
          type: ["string"],
        }),
        new ViewParam().with({
          name: "multiple",
          description: "指示是否可以选择多个选项",
          type: ["boolean"],
        }),
        new ViewParam().with({
          name: "value",
          description: "当前选择项的值，如果允许多选则为值的数组",
          type: "*",
        }),
      ],
      argument_types: ["item"],
    }),
    new ViewType().with({
      name: "item",
      description: "指示选择框内的单个选项",
      params: [
        new ViewParam().with({
          name: "name",
          description: "选项的显示名称",
          type: ["string"],
        }),
        new ViewParam().with({
          name: "value",
          description: "选项所代表的值",
          type: "*",
        }),
      ],
    }),
    new ViewType().with({
      name: "input-text",
      description: "可供用户输入字符串的输入框",
      params: [
        new ViewParam().with({
          name: "label",
          description: "显示在控件上的名称标题",
          type: ["string"],
        }),
        new ViewParam().with({
          name: "value",
          description: "用户输入的字符串",
          type: ["string"],
        }),
      ],
    }),
    new ViewType().with({
      name: "input-number",
      description: "可供用户输入数字的输入框",
      params: [
        new ViewParam().with({
          name: "label",
          description: "显示在控件上的名称标题",
          type: ["string"],
        }),
        new ViewParam().with({
          name: "value",
          type: ["number"],
        }),
        new ViewParam().with({
          name: "max",
          description: "输入数字的最大值",
          type: ["number"],
        }),
        new ViewParam().with({
          name: "min",
          description: "输入数字的最小值",
          type: ["number"],
        }),
      ],
    }),
    new ViewType().with({
      name: "input-color",
      description: "可供用户选择颜色的按钮",
      params: [
        new ViewParam().with({
          name: "label",
          description: "显示在控件上的名称标题",
          type: ["string"],
        }),
        new ViewParam().with({
          name: "value",
          description: '选择颜色的hex值，没有透明通道，形如 "#ffffff"',
          type: ["string"],
        }),
      ],
    }),
    new ViewType().with({
      name: "input-time",
      description: "可供用户选择日期时间的按钮",
      params: [
        new ViewParam().with({
          name: "label",
          description: "显示在控件上的名称标题",
          type: ["string"],
        }),
        new ViewParam().with({
          name: "value",
          description: '选择的时间，使用 "yyyy-MM-dd HH:mm:ss" 格式',
          type: ["string"],
        }),
        new ViewParam().with({
          name: "time",
          description: "是否可选择时间",
          type: ["boolean"],
        }),
        new ViewParam().with({
          name: "date",
          description: "是否可选择日期",
          type: ["boolean"],
        }),
      ],
    }),
    new ViewType().with({
      name: "input-duration",
      description: "可供用户选择时间长度的按钮",
      params: [
        new ViewParam().with({
          name: "label",
          description: "显示在控件上的名称标题",
          type: ["string"],
        }),
        new ViewParam().with({
          name: "value",
          description: '选择的时长，使用 "HH:mm:ss" 格式',
          type: ["string"],
        }),
        new ViewParam().with({
          name: "max",
          description: '最长时长，使用 "HH:mm:ss" 格式',
          type: ["string"],
        }),
        new ViewParam().with({
          name: "min",
          description: '最短时长，使用 "HH:mm:ss" 格式',
          type: ["string"],
        }),
      ],
    }),
    new ViewType().with({
      name: "waveform-chart",
      description: "用来显示2维或3维波形的视图组件，可以实时显示",
      params: [
        new ViewParam().with({
          name: "label",
          description: "显示在控件上的名称标题",
          type: ["string"],
        }),
        new ViewParam().with({
          name: "duration",
          description: '可显示区域的最长时长，使用 "HH:mm:ss" 格式',
          type: ["string"],
        }),
        new ViewParam().with({
          name: "color",
          description: "图表的线条颜色，使用CSS颜色值格式表示",
          type: ["string"],
        }),
      ],
    }),
    // new ViewType().with({
    //   name: "md",
    //   description: "使用Markdown进行格式化的富文本视图元素",
    //   argument_types: ["string"],
    // }),
  ];

  static schema = z
    .object({
      app_name: z.string().meta({
        title: "应用名称",
      }),
      app_describe: z.string().meta({
        title: "应用描述",
      }),
      now_time: z.string().meta({
        title: "当前时间",
        description: "用户电脑上显示的当前时间",
      }),
      current_conversation: z.lazy(() => Conversation.schema),
      available_views: z.array(z.lazy(() => ViewType.schema)).meta({
        title: "可用视图类型",
      }),
    })
    .meta({
      title: "应用上下文",
    });

  to_json() {
    this.now_time = new Date().toLocaleString();
    return Object.assign(Root.schema.parse(this), {
      $schema: z.toJSONSchema(Root.schema, {
        override: ({ jsonSchema }) => {
          delete jsonSchema.additionalItems;
          delete jsonSchema.additionalProperties;
          delete jsonSchema.required;
          delete jsonSchema.default;
        },
      }),
    });
  }
}

export class Conversation extends ContextNode<Conversation> {
  start_time: string;
  last_user_reaction_time: string;
  last_llm_reaction_time: string;

  static schema = z
    .object({
      start_time: z.string().meta({
        title: "开始时间",
      }),
      last_user_reaction_time: z.string().meta({
        title: "用户最后反应时间",
      }),
      last_llm_reaction_time: z.string().meta({
        title: "LLM最后反应时间",
      }),
    })
    .meta({
      title: "会话上下文",
    });
}

export class ViewType extends ContextNode<ViewType> {
  name: string;
  description: string;
  params?: ViewParam[] = [];
  argument_types?: string | string[] = "*";

  static schema = z
    .object({
      name: z.string().meta({
        title: "视图名称",
        description: "视图的名称，同时用作LISP函数名",
      }),
      description: z.string().meta({
        title: "视图描述",
      }),
      params: z.array(z.lazy(() => ViewParam.schema)).meta({
        title: "命名参数",
        description: "视图命名参数的列表",
      }),
      argument_types: z
        .union([
          z.literal("*"),
          z.array(
            z.union([
              z.literal("string"),
              z.literal("number"),
              z.literal("boolean"),
              z.literal("function"),
              z.string().meta({ title: "视图类型名称" }),
            ]),
          ),
        ])
        .meta({
          title: "非命名参数",
          description:
            '视图非命名参数的可能类型，可以是标量类型或者视图类型，"*"代表任意类型，默认情况下视图可以接收任意数量的非命名参数',
        }),
    })
    .meta({
      title: "视图类型",
    });
}

export class ViewParam extends ContextNode<ViewParam> {
  name: string;
  description?: string;
  required?: boolean = false;
  type?: string | string[] = "*";

  static schema = z
    .object({
      name: z.string().meta({
        title: "参数名称",
        description: "参数的名称，同时用作keyword名，不包含左侧的冒号号",
      }),
      description: z.optional(z.string()).meta({
        title: "参数描述",
      }),
      required: z.boolean().meta({
        title: "参数是否必须",
      }),
      type: z
        .union([
          z.literal("*"),
          z.array(
            z.union([
              z.literal("string"),
              z.literal("number"),
              z.literal("boolean"),
              z.literal("function"),
              z.string().meta({ title: "视图类型名称" }),
            ]),
          ),
        ])
        .meta({
          title: "参数类型",
          description:
            '参数值的类型，可以是标量类型或者视图类型，"*"代表任意类型',
        }),
    })
    .meta({
      title: "视图命名参数",
      description:
        "以Keyword Parameter语法传入View类型函数的命名参数信息，冒号在keyword左侧",
    });
}

// 中文版本是最新的版本，英文版本可能落后
export const SYSTEM_PROMPT = (context: Root) => `\
您是一位${context.app_name}的AI助手。当前应用上下文如下：

\`\`\`json
${JSON.stringify(context.to_json())}
\`\`\`

请遵循以下准则进行回复：
1. 始终使用**简体中文(zh_CN)**进行回复
2. 优先基于提供的上下文信息进行回答
3. 若上下文信息不足，请礼貌地请用户补充说明
4. 保持友好且专业的语气且尽量简洁

回复中可以包含特殊的代码块以实现特定的功能增强，特殊代码块包含以下几种：

- lisp: 使用 lisp 语言的代码块，可以在该代码块中放置一个 \`(view ...)\` 调用，\
该调用及其子级会在回复结束后被执行并生成为实际的视图界面来为用户提供更丰富的可视化功能，\
该代码块中的代码可以引用 js 代码块所产生的上下文对象，将属性名直接当作变量名引用即可。

对于 lisp 代码中的布尔值，使用 true/false 表示。

对于支持的用于实际构成视图界面的视图函数及其参数，可以查看应用上下文的 \`available_views\` 字段。

- js: 使用 javascript 语言的代码块，可以在该代码块中定义一个 \`prepare\` 函数，\
该函数会在回复结束后被执行来生成特殊的变量，该函数接收唯一的参数，类型为上面说的应用上下文。

prepare 函数可以返回一个对象，该对象的所有属性都可以在 lisp 代码块中作为变量直接引用。

如果导出的变量是固定值，则在 lisp 中也表现为对应类型的值，如果导出的变量是函数，则在 lisp 中\
也表现为函数，且可以作为变量传递给某些视图元素作为回调句柄使用来响应用户输入。

除此以外，还可以返回使用 \`writable\`、\`derived\`、\`readbale\` 函数创建的 Svelte Store，\
不需要导入，在 js 代码块的上下文中这3个函数可以直接使用，这意味着也可以使用 setTimeout 来动态更新界面，\
或是使用 writable 来获取界面上的用户输入。

注意js代码块会在所有lisp代码块之前执行。同时，js 与 lisp 环境共用 string/number/boolean/array/object/function \
这些基本类型，而 Svelte Store 则会被当作是其包含的基本类型，并在发生更新时动态更新 lisp 生成。

可以使用 \`\`\`[代码块类型]\\n ... \\n\`\`\` 的形式来使用这些特殊代码块。

比如以下两个代码块可以实现在界面上显示当前系统时间：

\`\`\`js
function prepare(context) {
  const time = writable("");
  const update = () => time.set(new Date().toLocaleTimeString());
  setInterval(update, 1000);
  return {
    vtime: time,
  };
}
\`\`\`

\`\`\`lisp
(view
  (label "当前时间: " vtime)
)
\`\`\`

如上所示，一般的流程是使用js代码块定义数据与信号处理算法、管线、命令，\
然后暴露出可绑定数据或方法提供给lisp代码块来创建视图界面。

对应回复中使用的 lisp 代码，请使用 2 空格的缩进进行格式化，并避免将占用多行的表达式的\
闭括号紧跟在单行表达式的闭括号之后，请另起独立的一行闭合其括号并遵循缩进。

**特别注意必须保证 lisp 代码的开闭括号正确无误！**
`;

// You are an AI assistant for ${context.app_name}. Here is the current app context:

// \`\`\`json
// ${JSON.stringify(json)}
// \`\`\`

// Please respond according to the following guidelines:
// 1. Always reply in **Simplified Chinese (zh_CN)**
// 2. Prioritize answers based on the provided context
// 3. If the context is insufficient, politely ask the user for clarification
// 4. Maintain a friendly and professional tone

// Response may include embedded view in Scheme LISP markup. Refer to the \`available_views\` in \
// the context for supported view functions and arguments. Each view code should be put inside \
// a (view ...) call with in a \`\`\`lisp ... \`\`\` code block, app will parse and render the real \
// view below the assistant content.

export const Contexts = {
  Root,
  Conversation,
};
