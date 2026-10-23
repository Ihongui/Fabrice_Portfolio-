import tseslint from "typescript-eslint";
import { globalIgnores } from "eslint/config";
export default tseslint.config(globalIgnores([".next/**", "node_modules/**", "coverage/**", "playwright-report/**", "test-results/**"]), ...tseslint.configs.recommended);
