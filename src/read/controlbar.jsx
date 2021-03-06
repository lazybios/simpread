console.log( "=== simpread read controlbar load ===" )

import * as ss     from 'stylesheet';
import {browser}   from 'browser';
import * as msg    from 'message';
import th          from 'theme';
import * as conf   from 'config';
import * as output from 'output';
import * as watch  from 'watch';
import * as kbd    from 'keyboard';

import Fab         from 'fab';

const tooltip_options = {
    target   : "name",
    position : "bottom",
    delay    : 50,
};

/**
 * Read controlbar
 * 
 * @class
 */
export default class ReadCtlbar extends React.Component {

    static propTypes = {
        onAction: React.PropTypes.func,
    }

    componentDidMount() {
        browser.runtime.onMessage.addListener( ( request, sender, sendResponse ) => {
            if ( request.type == msg.MESSAGE_ACTION.export ) {
                console.log( "controlbar runtime Listener", request );
                new Notify().Render( "已重新授权成功！" );
                this.onAction( undefined, request.value.type );
            }
        });
        kbd.Listen( combo => {
            this.onAction( undefined, combo )
        });
    }

    onAction( event, type ) {
        console.log( "fab type is =", type )

        const action = ( event, type ) => {
            this.props.multi && 
            [ "markdown", "dropbox", "yinxiang","evernote", "onenote", "gdrive" ].includes( type ) &&
            new Notify().Render( "当前为论坛类页面，不建议使用导出服务，有可能出现未知错误。" );

            switch ( true ) {
                case [ "exit", "setting" ].includes( type ):
                    this.props.onAction( type );
                    break;
                /*
                case [ "up", "down" ].includes( type ):
                    this.props.onAction && this.props.onAction( "scroll", type == "up" ? -250 : 250 );
                    break;
                */
                case type.indexOf( "_" ) > 0 && ( type.startsWith( "fontfamily" ) || type.startsWith( "fontsize" ) || type.startsWith( "layout" )):
                    if ( !ss.VerifyCustom( type.split( "_" )[0], this.props.custom ) ) {
                        const [ key, value ] = [ type.split( "_" )[0], type.split( "_" )[1] ];
                        Object.keys( ss ).forEach( (name)=>name.toLowerCase() == key && ss[name]( value ));
                        this.props.onAction && this.props.onAction( key, value );    
                    } else {
                        new Notify().Render( '由于已使用 自定义样式，因此当前操作无效，详细说明 <a href="https://github.com/Kenshin/simpread/wiki/自定义样式" target="_blank">请看这里</a>' );
                    }
                    break;
                case type.indexOf( "_" ) > 0 && type.startsWith( "theme" ):
                    if ( !ss.VerifyCustom( type.split( "_" )[0], this.props.custom ) ) {
                        let i = th.names.indexOf( th.theme );
                        i = type.endsWith( "prev" ) ? --i : ++i;
                        i >= th.names.length && ( i = 0 );
                        i < 0 && ( i = th.names.length - 1 );
                        th.Change( th.names[i] );
                        this.props.onAction && this.props.onAction( type.split( "_" )[0], th.theme );
                    } else {
                        new Notify().Render( '由于已使用 自定义样式，因此当前操作无效，详细说明 <a href="https://github.com/Kenshin/simpread/wiki/自定义样式" target="_blank">请看这里</a>' );
                    }
                    break;
                default:
                    if ( type.indexOf( "_" ) > 0 && type.startsWith( "share" ) || 
                        [ "save", "markdown", "png", "epub", "pdf", "kindle", "dropbox", "pocket", "instapaper", "linnk", "yinxiang","evernote", "onenote", "gdrive" ].includes( type )) {
                        const [ title, desc, content ] = [ $( "sr-rd-title" ).text().trim(), $( "sr-rd-desc" ).text().trim(), $( "sr-rd-content" ).html().trim() ];
                        output.Action( type, title, desc, content );
                    }
            }
        };

        type != "exit" ? watch.Verify( ( state, result ) => {
            if ( state ) {
                console.log( "watch.Lock()", result );
                new Notify().Render( "配置文件已更新，刷新当前页面后才能生效。", "刷新", ()=>location.href = location.href );
            } else action( event, type );
        }) : action( event, type );

    }

    componentWillMount() {
        if ( this.props.type.startsWith( "txtread::" ) && this.props.type.endsWith( "::local" )) {
            delete conf.readItems.download;
            delete conf.readItems.readlater;
            delete conf.readItems.send;
            delete conf.readItems.share;
        }
    }

    constructor( props ) {
        super( props );
    }

    render() {
        return (
            <sr-rd-crlbar class={ this.props.show ? "" : "controlbar" } style={{ "zIndex": "2" }}>
                <Fab items={ conf.readItems } tooltip={ tooltip_options } waves="md-waves-effect md-waves-circle md-waves-float" onAction={ (event, type)=>this.onAction(event, type ) } />
            </sr-rd-crlbar>
        )
    }
}
