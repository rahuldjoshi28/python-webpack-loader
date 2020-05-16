#Python Loader
python-webpack-loader is a webpack based loader which transpile python files into javascript files.
It let you write `python` code in your `javascript` project.

## Set up

1. Install `python-webpack-loader`:
   ```
   npm install --save-dev python-webpack-loader
   ```
2. Configure python-webpack-loader in webpack:
   In your webpack config file add following rule inside _module_ > _rules_:
   ```
   {
       test: /\.py$/,
       use: [{ loader: 'python-webpack-loader' }]
   }
   ```

Now you are ready to use this plugin
You can see simple example of how to use _python-webpack-loader_ in `example` folder

## Some features yet to be implemented:

1. `inbuilt modules`: Use of inbuild python modules is yet to be integrated in this loader.
2. `Libraries`: Use of external libraries is not supported
