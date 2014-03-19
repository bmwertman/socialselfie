class Selfie < ActiveRecord::Base
	mount_uploader :image_url, ImageOnAwsUploader

	# Creates the caption based on the user input
	def self.create_caption(json_analysis)
		ret_string_ar = []
		return ret_string_ar.sample
	end

	# The image analysis returns a Ruby Hash
	def self.set_analysis_values(in_selfie, ret_val)
		in_selfie.caption = Selfie.create_caption(ret_val)
	end
end
