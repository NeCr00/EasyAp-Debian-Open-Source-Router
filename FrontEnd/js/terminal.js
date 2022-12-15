jQuery(function ($, undefined) {

    $("#apply-terminal").click(function () {
        var terminal = $('#terminal').terminal(function(command) {
            console.log(command);
        })
    })
        

    $('#terminal').terminal(function (command) {

        


        if (command == 'help') {
            this.echo("Type the following.\n");
            this.echo("1. Companies worked for or experience=> exp")
            this.echo("2. Socials => social\n");
        }

        //  if (command == 'social'){ .  This was wrong. 
        else if (command == 'social') {
            this.echo("mailto:gaurav.dev.iiitm@gmail.com\n")
            this.echo("https://www.github.com/chowmean\n")
            this.echo("https://www.facebook.com/chowmean\n")
            this.echo("https://www.twitter.com/gauravchowmean\n")
            this.echo("https://www.linkedin.com/in/chowmean\n")
        }

        //   if (command == 'exp'){ .This was wrong. 
        else if (command == 'exp') {
            this.echo("\n")
            this.echo("Platform Engineer, Practo technologies. Jan 2017 - Present\n\n")
            this.echo("\n")
            this.echo("Software Developement Engineer, Practo technologies. May 2016 - Dec 2016\n\n")
            this.echo("\n")
            this.echo("Freelance Software Architect, Unihire. Mar 2016 - April 2016\n\n")
            this.echo("\n")
            this.echo("Laravel and Angular Developer, Infinite Eurekas. Oct 2015 - Nov 2015\n\n")
            this.echo("\n")
            this.echo("Python Developer, Lazylad. Sep 2015 - Oct 2015\n\n")
            this.echo("\n")
            this.echo("Software Developer, Frankly.me, May 2015 - Jul 2015\n\n")
            this.echo("\n")
            this.echo("Software Developer, GeekShastra Pvt Ltd, May 2014 - Jul 2014\n\n")
            this.echo("\n")
            this.echo("Software Developer, Decent Solutions, Dec 2013 - Mar 2014\n\n")
            this.echo("\n")
        } else {
            if (command !== '') {
                try {
                    var result = window.eval(command);
                    if (result !== undefined) {
                        this.echo(new String(result));
                    }
                } catch (e) {
                    this.error(new String('Wrong command. Try again !'));
                }
            } else {
                this.echo('');
            }
        }


    }, {
        greetings: 'Import a custom firewall rule using iptables and press Enter',
        name: 'LiveShell',
        prompt: ' Terminal > ',
     
        
    });
});

