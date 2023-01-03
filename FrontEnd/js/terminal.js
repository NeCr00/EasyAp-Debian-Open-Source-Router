

jQuery(function ($, undefined) {

    function postData(url, data) {
        return fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
      }

    async function submitRule(rule,obj){
        data = {"rule":rule}
        response = await postData("firewall/custom-rule",data);
        response_data = await response.json();
       obj.echo( response_data.message)
    }

    $("#apply-terminal").click(function () {
        var terminal = $('#terminal').terminal(function(command) {
            console.log(command);
        })
    })
        

    $('#terminal').terminal(function (command) {

        var regex = new RegExp("(^iptables\\s.*) --name\\s*([a-zA-Z][a-zA-Z0-9-_]{0,40})","g");
        var iscorrect = regex.test(command);
        if (command == 'help') {
            this.echo(" Type the following:");
            this.echo(" iptables [parameters] --name <name of rule>");
            this.echo(" Example: iptables -A INPUT -i eth1 -s 192.168.0.0/24 -j DROP --name My custom rule");
        }

        //  if (command == 'social'){ .  This was wrong. 
        else if (iscorrect)  {
            this.echo("Submiting ...");
            response = submitRule(command,this)
            //this.echo(response)
        }

         else {
            if (command !== '') {
                try {
                    var result = window.eval(command);
                    if (result !== undefined) {
                        this.echo(new String(result));
                    }
                } catch (e) {
                    this.error(new String('Wrong command. Try again or type "help" !'));
                }
            } else {
                this.echo('');
            }
        }


    }, {
        greetings: 'Import a custom firewall rule using iptables and press Enter \nType help for more information',
        name: 'LiveShell',
        prompt: ' Terminal > ',
     
        
    });
});

