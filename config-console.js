const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const generate = require("@babel/generator").default;
const types = require("@babel/types");

const sourceCode = `
    console.log(1);

    function func() {
        console.info(2);
    }

    export default class Class {
        say() {
            console.debug(3);
        }
        render() {
            return <div>{console.error(4)}</div>
        }
    }
`;
const ast = parser.parse(sourceCode, {
  sourceType: "unambiguous",
  plugins: ["jsx"],
});

traverse(ast, {
  CallExpression(path, state) {
    if (
      types.isMemberExpression(path.node.callee) &&
      path.node.callee.object.name === "console" &&
      ["log", "info", "error", "debug"].includes(path.node.callee.property.name)
    ) {
      const { line, column } = path.node.loc.start;
      // 创造ast节点
      const comment = types.stringLiteral(`//`);
      // 插入ast节点
      path.node.arguments.unshift(
        types.stringLiteral(`filename: (${line}, ${column})`)
      );
      path.skip(); // 跳过子节点遍历
      path.insertBefore(comment);
    }
  },
});
const { code, map } = generate(ast);
console.log(code);
