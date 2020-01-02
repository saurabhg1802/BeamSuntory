public class ConsumerCaseController {
    
    public ApexPages.StandardController controller {get; set;}
    public String brand {get;set;}
    public string product {get;set;}
    public string confirmEmail {get;set;}
    public List<SelectOption> productsOption {get;set;}
    public List<SelectOption> ReasonsOption {get;set;}
    public Boolean isComplaint {get;set;}
    public Boolean isInquery {get;set;}
    public ConsumerCaseController(ApexPages.StandardController controller)
    {
        brand = apexpages.currentpage().getparameters().get('brand');
        this.productsOption = getProductOptions(brand);
        this.ReasonsOption = getReasonOptions(brand);
        isComplaint = false;
        isInquery = false;
    }
    
    public List<SelectOption> getProductOptions(string brandName) {
        List<SelectOption> productOption = new List<SelectOption>();
        if(brandName == 'Jim Beam'){
            productOption.add(new SelectOption('Jim Beam1','Jim Beam1'));
            productOption.add(new SelectOption('Jim Beam2','Jim Beam2'));
        } else {
            productOption.add(new SelectOption('Consumer1','Consumer1'));
            productOption.add(new SelectOption('Consumer2','Consumer2'));   
        }
        return productOption;
    }
    
    public List<SelectOption> getReasonOptions(string brandName) {
        List<SelectOption> reasonOption = new List<SelectOption>();
        if(brandName == 'Jim Beam'){
            reasonOption.add(new SelectOption('Other','Other'));
            reasonOption.add(new SelectOption('Issue with product','Issue with product'));
        }else{
            reasonOption.add(new SelectOption('General Inquiry','General Inquiry'));
            reasonOption.add(new SelectOption('Online Store','Online Store'));   
            reasonOption.add(new SelectOption('Product/Packaging Issue','Product/Packaging Issue'));
        }
        return reasonOption;
    }
}