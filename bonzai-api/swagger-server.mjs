import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

const app = express();

const swaggerDocs = YAML.load('./docs/docs.yml');

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

const port = 3000;
app.listen(port, () => {
	console.log(`Swagger docs available at http://localhost:${port}/api/docs`);
});
