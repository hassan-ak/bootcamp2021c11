# Step 03 - AppSync Lambda as Data Source

## Steps to code

1. Create a new directory by using `mkdir step03_appsync_lambda_as_datasource`
2. Naviagte to the newly created directory using `cd step03_appsync_lambda_as_datasource`
3. Create a cdk app using `cdk init app --language typescript`
4. Use `npm run watch` to auto build our app as we code
5. Install AppSync in the app using `npm i @aws-cdk/aws-appsync`
6. Install lambda in the app using `npm i @aws-cdk/aws-lambda`
7. Update "lib/step03_appsync_lambda_as_datasource-stack.ts" to import appsync and lambda in the stack

   ```
   import * as appsync from "@aws-cdk/aws-appsync";
   import * as lambda from "@aws-cdk/aws-lambda";
   ```

8. create ./graphql/schema.gql

   ```
   type Query {
      notes: [String]
   }
   ```

9. update "lib/step03_appsync_lambda_as_datasource-stack.ts" to create a new appSync graphQL api

   ```
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
   ```

10. update "lib/step03_appsync_lambda_as_datasource-stack.ts" to print gql API and key

    ```
      new cdk.CfnOutput(this, "APIGraphQLURL", {
        value: api.graphqlUrl,
      });
    ```

    ```
      new cdk.CfnOutput(this, "APIGraphQLURL", {
        value: api.graphqlUrl,
      });
    ```

11. Create "lambda/index.ts" to create a lambda function

    ```
    type AppSyncEvent = {
      info: {
        fieldName: String;
      };
    };

    exports.handler = async (event: AppSyncEvent) => {
      const notesArray = ["note1", "note2", "note3"];

      switch (event.info.fieldName) {
        case "notes":
          return notesArray;
        default:
          return null;
      }
    };
    ```

12. update "lib/step03_appsync_lambda_as_datasource-stack.ts" to create a lambda construct

    ```
    const lambda_function = new lambda.Function(this, "LambdaFunction", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "index.handler",
      timeout: cdk.Duration.seconds(10),
    });
    ```

13. update "lib/step03_appsync_lambda_as_datasource-stack.ts" to connect API to the lambda source

    ```
    const lambda_data_source = api.addLambdaDataSource(
      "lambdaDataSource",
      lambda_function
    );
    ```

14. update "lib/step03_appsync_lambda_as_datasource-stack.ts" to cdefine a resolver

    ```
    lambda_data_source.createResolver({
      typeName: "Query",
      fieldName: "notes",
    });
    ```

15. build the app using `npm run build` or `npm run watch`
16. deploy the app using `cdk deploy`
17. Test Api on Pastman
    - Signup to Pastman
    - Open a new workspace
    - Create a new API
      - define schema
      - generate collection
    - Move to collection
      - Create auth based on APi key
      - use API key from the cdk deploy
      - in the post tab test the api by providing url from cdk deploy
18. Destroy the app using `cdk destroy`
