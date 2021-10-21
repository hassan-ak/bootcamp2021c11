import * as cdk from "@aws-cdk/core";
import * as appsync from "@aws-cdk/aws-appsync";
import * as lambda from "@aws-cdk/aws-lambda";

export class Step03AppsyncLambdaAsDatasourceStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // AppSync API gives you a graphql api with key
    const api = new appsync.GraphqlApi(this, "GRAPHQL_API", {
      name: "cdk-api",
      schema: appsync.Schema.fromAsset("graphql/schema.gql"),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            expires: cdk.Expiration.after(cdk.Duration.days(20)),
          },
        },
      },
      xrayEnabled: true,
    });

    // Print GraphAL API URL and key on console after deploy
    new cdk.CfnOutput(this, "APIGraphQLURL", {
      value: api.graphqlUrl,
    });

    new cdk.CfnOutput(this, "APIGraphQLKey", {
      value: api.apiKey || "",
    });

    // Lambda Function
    const lambda_function = new lambda.Function(this, "LambdaFunction", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "index.handler",
      timeout: cdk.Duration.seconds(10),
    });

    // Set lambda as data source
    const lambda_data_source = api.addLambdaDataSource(
      "lambdaDataSource",
      lambda_function
    );

    // Describe resolver for data source
    lambda_data_source.createResolver({
      typeName: "Query",
      fieldName: "notes",
    });
  }
}
