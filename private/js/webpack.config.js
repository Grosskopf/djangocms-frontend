const argv = require('minimist')(process.argv.slice(2));
const plugins = [];
const webpack = require('webpack');
const path = require('path');1
const CopyPlugin = require("copy-webpack-plugin");


process.env.NODE_ENV = (argv.debug) ? 'development' : 'production';

plugins.push(
    new webpack.optimize.CommonsChunkPlugin({
        name: 'base',
        chunks: ['base', 'grid', 'link'],
    })
);
plugins.push(
    new CopyPlugin([{
        from: path.join(
            __dirname, '..', '..', 'node_modules', 'bootstrap', 'dist', 'js', 'bootstrap.bundle.js'),
        to: path.join(
            __dirname, '..', '..', 'djangocms_frontend', 'static', 'djangocms_frontend', 'js', 'bundle.bootstrap5.js'),
    }])
)

// add plugins depending on if we are debugging or not
if (argv.debug) {
    plugins.push(
        new webpack.LoaderOptionsPlugin({
            minimize: false,
            debug: true,
        })
    );
    plugins.push(
        new webpack.DefinePlugin({
            DEBUG: 'true',
        })
    );
} else {
    plugins.push(new webpack.optimize.ModuleConcatenationPlugin());
    plugins.push(new webpack.optimize.OccurrenceOrderPlugin());
    plugins.push(
        new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false,
        })
    );
    plugins.push(
        new webpack.DefinePlugin({
            DEBUG: 'false',
        })
    );
    plugins.push(
        new webpack.optimize.UglifyJsPlugin({
            beautify: false,
            mangle: {
                screw_ie8: true,
                keep_fnames: true,
            },
            compress: {
                screw_ie8: true,
            },
            comments: false,
        })
    );
}

module.exports = {
    devtool: argv.debug ? 'cheap-module-eval-source-map' : false,
    entry: {
        base: path.join(__dirname, 'base.js'),
        link: path.join(__dirname, 'link.js'),
        grid: path.join(__dirname, 'grid.js'),
    },
    output: {
        path: path.join(__dirname, '..', '..', 'djangocms_frontend', 'static', 'djangocms_frontend', 'js'),
        filename: 'bundle.[name].js',
        publicPath: '/static/',
    },
    plugins: plugins,
    resolve: {
        modules: [__dirname, 'node_modules'],
        alias: {
            // make sure that we always use our jquery when loading 3rd party plugins
            jquery: require.resolve('jquery'),
        },
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: [{
                    loader: 'babel-loader',
                    options: {
                        retainLines: true,
                    },
                }],
                exclude: /(node_modules|vendor|libs|addons\/jquery.*)/,
                include: __dirname,
            },
            {
                test: /^bootstrap$/,
                use: [{
                    loader: 'imports-loader',
                    options: {
                        $: 'jquery',
                        jQuery: 'jquery',
                        PopperModule: 'popper.js',
                        Popper: '>PopperModule.default',
                    },
                }],
            },
        ],
    },
}

// disable DeprecationWarning: loaderUtils.parseQuery() DeprecationWarning
process.noDeprecation = true;
