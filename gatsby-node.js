exports.createSchemaCustomization = ({ actions, schema }) => {
  actions.createTypes(
    schema.buildObjectType({
      name: `Test`,
      interfaces: [`Node`],
      fields: {
        child_items: {
          type: `[Test]`,
          args: {
            limit: "Int",
            sort: `TestSortInput`,
          },
          resolve: async (source, args, context) => {
            const { entries } = await context.nodeModel.findAll({
              query: {
                filter: {
                  parentNodeId: {
                    eq: source.id,
                  },
                },
                limit: args.limit,
                sort: args.sort,
              },
              type: `Test`,
            });
            return entries;
          },
        },
      },
    })
  );
};

exports.sourceNodes = ({ actions }) => {
  actions.createNode({
    id: `1`,
    parentNodeId: undefined,
    label: "Top #1",
    sort1: 0,
    sort2: 9,
    internal: {
      type: `Test`,
      contentDigest: `0`,
    },
  });

  actions.createNode({
    id: `1-1`,
    parentNodeId: `1`,
    label: "Child #1->#1",
    sort1: 1,
    sort2: 8,
    internal: {
      type: `Test`,
      contentDigest: `0`,
    },
  });

  actions.createNode({
    id: `1-2`,
    parentNodeId: `1`,
    label: "Child #1->#2",
    sort1: 2,
    sort2: 7,
    internal: {
      type: `Test`,
      contentDigest: `0`,
    },
  });
};
