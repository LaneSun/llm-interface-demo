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
      name: "h-box",
      description: "使内部元素水平放置的布局容器",
    }),
    new ViewType().with({
      name: "v-box",
      description: "使内部元素垂直放置的布局容器",
    }),
    new ViewType().with({
      name: "grid",
      description: "使内部元素网格布局的布局容器",
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
      name: "text",
      description: "显示文本的视图元素",
      argument_types: ["string"],
    }),
    new ViewType().with({
      name: "md",
      description: "使用Markdown进行格式化的富文本视图元素",
      argument_types: ["string"],
    }),
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
              z.string().meta({ title: "视图类型名称" }),
            ]),
          ),
        ])
        .meta({
          title: "非命名参数",
          description:
            '视图非命名参数的可能类型，可以是标量类型或者视图类型，"*"代表任意类型',
        }),
    })
    .meta({
      title: "视图类型",
    });
}

export class ViewParam extends ContextNode<ViewParam> {
  name: string;
  description: string;
  type?: string | string[] = "*";

  static schema = z
    .object({
      name: z.string().meta({
        title: "参数名称",
        description: "参数的名称，同时用作keyword名",
      }),
      description: z.string().meta({
        title: "参数描述",
      }),
      type: z
        .union([
          z.literal("*"),
          z.array(
            z.union([
              z.literal("string"),
              z.literal("number"),
              z.literal("boolean"),
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
        "以Keyword Parameter语法传入View类型函数的命名参数信息，':' 号在前",
    });
}

export const Contexts = {
  Root,
  Conversation,
};
